import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { BoardRoles } from 'src/libs/enum/board.roles';
import { TeamRoles } from 'src/libs/enum/team.roles';
import {
	fillDividedBoardsUsersWithTeamUsers,
	translateBoard
} from 'src/libs/utils/communication-helpers';
import { getDay, getNextMonth } from 'src/libs/utils/dates';
import { generateBoardDtoData, generateSubBoardDtoData } from 'src/libs/utils/generateBoardData';
import isEmpty from 'src/libs/utils/isEmpty';
import { GetBoardServiceInterface } from 'src/modules/boards/interfaces/services/get.board.service.interface';
import { TYPES } from 'src/modules/boards/interfaces/types';
import { TeamDto } from 'src/modules/communication/dto/team.dto';
import { CommunicationServiceInterface } from 'src/modules/communication/interfaces/slack-communication.service.interface';
import * as CommunicationsType from 'src/modules/communication/interfaces/types';
import { AddCronJobDto } from 'src/modules/schedules/dto/add.cronjob.dto';
import { CreateSchedulesServiceInterface } from 'src/modules/schedules/interfaces/services/create.schedules.service.interface';
import * as SchedulesType from 'src/modules/schedules/interfaces/types';
import { GetTeamServiceInterface } from 'src/modules/teams/interfaces/services/get.team.service.interface';
import { TYPES as TeamType } from 'src/modules/teams/interfaces/types';
import TeamUser, { TeamUserDocument } from 'src/modules/teams/entities/team.user.schema';
import User from 'src/modules/users/entities/user.schema';
import BoardDto from '../dto/board.dto';
import BoardUserDto from '../dto/board.user.dto';
import { Configs, CreateBoardService } from '../interfaces/services/create.board.service.interface';
import Board, { BoardDocument } from '../schemas/board.schema';
import BoardUser, { BoardUserDocument } from '../schemas/board.user.schema';
import { UpdateTeamServiceInterface } from 'src/modules/teams/interfaces/services/update.team.service.interface';
import { addMonths, isAfter } from 'date-fns';

export interface CreateBoardDto {
	maxUsers: number;
	board: BoardDto;
	team: TeamDto | null;
	users: BoardUserDto[];
}

@Injectable()
export default class CreateBoardServiceImpl implements CreateBoardService {
	private logger = new Logger(CreateBoardServiceImpl.name);

	constructor(
		@InjectModel(Board.name) private boardModel: Model<BoardDocument>,
		@InjectModel(BoardUser.name)
		private boardUserModel: Model<BoardUserDocument>,
		@Inject(forwardRef(() => TeamType.services.GetTeamService))
		private getTeamService: GetTeamServiceInterface,
		@Inject(forwardRef(() => TeamType.services.UpdateTeamService))
		private updateTeamService: UpdateTeamServiceInterface,
		@Inject(TYPES.services.GetBoardService)
		private getBoardService: GetBoardServiceInterface,
		@Inject(SchedulesType.TYPES.services.CreateSchedulesService)
		private createSchedulesService: CreateSchedulesServiceInterface,
		@Inject(CommunicationsType.TYPES.services.SlackCommunicationService)
		private slackCommunicationService: CommunicationServiceInterface
	) {}

	saveBoardUsers(newUsers: BoardUserDto[], newBoardId: string) {
		Promise.all(newUsers.map((user) => this.boardUserModel.create({ ...user, board: newBoardId })));
	}

	async createDividedBoards(boards: BoardDto[], userId: string) {
		const newBoardsIds = await Promise.allSettled(
			boards.map(async (board) => {
				const { users } = board;
				const { _id } = await this.createBoard(board, userId, true);

				if (!isEmpty(users)) {
					this.saveBoardUsers(users, _id);
				}

				return _id;
			})
		);

		return newBoardsIds.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
	}

	async createBoard(boardData: BoardDto, userId: string, isSubBoard = false) {
		const { dividedBoards = [], team } = boardData;

		/**
		 * Add in each divided board the team id (from main board)
		 */
		const dividedBoardsWithTeam = dividedBoards.map((dividedBoard) => ({ ...dividedBoard, team }));

		return this.boardModel.create({
			...boardData,
			createdBy: userId,
			dividedBoards: await this.createDividedBoards(dividedBoardsWithTeam, userId),
			isSubBoard
		});
	}

	async saveBoardUsersFromTeam(newUsers: BoardUserDto[], team: string, responsibles: string[]) {
		const usersIds: string[] = [];
		const teamUsers = await this.getTeamService.getUsersOfTeam(team);

		teamUsers.forEach((teamUser) => {
			const user = teamUser.user as User;

			if (!usersIds.includes(user._id.toString())) {
				newUsers.push({
					user: user._id.toString(),
					role: responsibles.includes(user._id.toString())
						? BoardRoles.RESPONSIBLE
						: this.handleBoardUserRole(teamUser),
					votesCount: 0
				});
			}
		});
	}

	handleBoardUserRole(teamUser: TeamUser): string {
		return teamUser.role === TeamRoles.ADMIN
			? BoardRoles.MEMBER
			: teamUser.role === TeamRoles.STAKEHOLDER
			? BoardRoles.RESPONSIBLE
			: teamUser.role;
	}

	async create(boardData: BoardDto, userId: string, fromSchedule = false) {
		const { team, recurrent, maxUsers, slackEnable } = boardData;
		const newUsers = [];

		const newBoard = await this.createBoard(boardData, userId);

		if (team) {
			await this.saveBoardUsersFromTeam(newUsers, team, boardData.responsibles);
		}

		this.saveBoardUsers(newUsers, newBoard._id);

		if (newBoard && recurrent && team && maxUsers) {
			const addCronJobDto: AddCronJobDto = {
				boardId: newBoard._id.toString(),
				ownerId: userId,
				teamId: team,
				maxUsersPerTeam: maxUsers
			};

			if (!fromSchedule) {
				this.createFirstCronJob(addCronJobDto);
			}
		}

		this.logger.verbose(`Communication Slack Enable is set to "${boardData.slackEnable}".`);

		if (slackEnable) {
			const result = await this.getBoardService.getBoard(newBoard._id, userId);

			if (result?.board) {
				this.logger.verbose(`Call Slack Communication Service for board id "${newBoard._id}".`);
				const board = fillDividedBoardsUsersWithTeamUsers(translateBoard(result.board));
				this.slackCommunicationService.execute(board);
			} else {
				this.logger.error(
					`Call Slack Communication Service for board id "${newBoard._id}" fails. Board not found.`
				);
			}
		}

		return newBoard;
	}

	createFirstCronJob(addCronJobDto: AddCronJobDto) {
		this.createSchedulesService.addCronJob(getDay(), getNextMonth() - 1, addCronJobDto);
	}

	verifyIfIsNewJoiner = (joinedAt: Date, providerAccountCreatedAt?: Date) => {
		const dateToCompare = providerAccountCreatedAt || joinedAt;

		const maxDateToBeNewJoiner = addMonths(dateToCompare, 3);

		return !isAfter(maxDateToBeNewJoiner, new Date());
	};

	async splitBoardByTeam(
		ownerId: string,
		teamId: string,
		configs: Configs
	): Promise<string | null> {
		const { maxUsersPerTeam } = configs;

		let teamUsers = await this.getTeamService.getUsersOfTeam(teamId);

		teamUsers = teamUsers.map((teamUser: TeamUser) => {
			const user = teamUser.user as User;

			if (
				teamUser.isNewJoiner &&
				this.verifyIfIsNewJoiner(user.joinedAt, user.providerAccountCreatedAt)
			) {
				this.updateTeamService.updateTeamUser({
					team: teamId,
					user: `${user._id}`,
					role: teamUser.role,
					isNewJoiner: false
				});

				teamUser.isNewJoiner = false;
			}

			return teamUser;
		});

		const teamUsersWotStakeholders = teamUsers.filter(
			(teamUser) => !(teamUser.role === TeamRoles.STAKEHOLDER) ?? []
		);
		const teamLength = teamUsersWotStakeholders.length;
		const maxTeams = this.findMaxUsersPerTeam(teamLength, maxUsersPerTeam);

		if (maxTeams < 2 || maxUsersPerTeam < 2) {
			return null;
		}

		const team = await this.getTeamService.getTeam(teamId);
		const responsibles = [];

		const boardData: BoardDto = {
			...generateBoardDtoData(
				`${team.name}-mainboard-${configs.date?.getUTCDay()}-${new Intl.DateTimeFormat('en-US', {
					month: 'long'
				}).format(configs.date)}-${configs.date?.getFullYear()}`
			).board,
			users: [],
			team: teamId,
			dividedBoards: this.handleSplitBoards(maxTeams, teamUsersWotStakeholders, responsibles),
			recurrent: configs.recurrent,
			maxVotes: configs.maxVotes ?? null,
			hideCards: configs.hideCards ?? false,
			hideVotes: configs.hideVotes ?? false,
			maxUsers: configs.maxUsersPerTeam,
			slackEnable: configs.slackEnable,
			responsibles
		};

		const board = await this.create(boardData, ownerId, true);

		if (!board) return null;

		return board._id.toString();
	}

	private findMaxUsersPerTeam = (teamLength: number, maxUsersPerTeam: number): number => {
		let maxTeams = 0;
		do {
			maxTeams = teamLength / maxUsersPerTeam;

			if (maxTeams < 2) {
				maxUsersPerTeam -= 1;

				if (maxTeams <= 0 || maxUsersPerTeam <= 1) {
					return 0;
				}
			}
		} while (maxTeams < 2);

		return Math.round(maxTeams);
	};

	sortUsersListByOldestCreatedDate = (users: TeamUser[]) =>
		users
			.map((user) => {
				user.userCreated =
					(user.user as User).providerAccountCreatedAt || (user.user as User).joinedAt;

				return user;
			})
			.sort((a, b) => Number(b.userCreated) - Number(a.userCreated));

	getAvailableUsersToBeResponsible = (availableUsers: TeamUser[]) => {
		const availableUsersListSorted = this.sortUsersListByOldestCreatedDate(availableUsers);

		// returns the user who has the oldest account date
		const selectedAvailableUser = availableUsersListSorted.slice(0, 1);

		const findSelectedAvailableUser = availableUsers.find(
			(user) => (user.user as User)._id === (selectedAvailableUser[0].user as User)._id
		);

		findSelectedAvailableUser.isNewJoiner = false;

		const findSelectedAvailableUserArray: TeamUser[] = [];

		findSelectedAvailableUserArray.push(findSelectedAvailableUser);

		return findSelectedAvailableUserArray;
	};

	getRandomGroup = (usersPerTeam: number, availableUsers: TeamUser[]) => {
		const randomGroupOfUsers = [];

		let availableUsersToBeResponsible = availableUsers.filter((user) => !user.isNewJoiner);

		if (availableUsersToBeResponsible.length < 1) {
			availableUsersToBeResponsible = this.getAvailableUsersToBeResponsible(availableUsers);
		}

		// this object ensures that each group has one element that can be responsible
		const candidateToBeTeamResponsible = this.getRandomUser(availableUsersToBeResponsible);

		randomGroupOfUsers.push({
			user: (candidateToBeTeamResponsible.user as User)._id,
			role: BoardRoles.MEMBER,
			votesCount: 0,
			isNewJoiner: candidateToBeTeamResponsible.isNewJoiner
		});

		const availableUsersWotResponsible = availableUsers.filter(
			(user) => (user.user as User)._id !== (candidateToBeTeamResponsible.user as User)._id
		);

		let i = 0;

		// adds the rest of the elements of each group
		while (i < usersPerTeam - 1) {
			const teamUser = this.getRandomUser(availableUsersWotResponsible);
			randomGroupOfUsers.push({
				user: (teamUser.user as User)._id,
				role: BoardRoles.MEMBER,
				votesCount: 0,
				isNewJoiner: teamUser.isNewJoiner
			});
			i++;
		}

		return randomGroupOfUsers;
	};

	getRandomUser = (list: TeamUser[]) => list.splice(Math.floor(Math.random() * list.length), 1)[0];

	handleSplitBoards = (
		maxTeams: number,
		teamMembers: LeanDocument<TeamUserDocument>[],
		responsibles: string[]
	) => {
		const subBoards: BoardDto[] = [];
		const splitUsers: BoardUserDto[][] = new Array(maxTeams).fill([]);

		let availableUsers = [...teamMembers];
		const usersPerTeam = Math.floor(teamMembers.length / maxTeams);
		let membersWithoutTeam = teamMembers.length;
		let countNumberOfGroups = 0;

		new Array(maxTeams).fill(0).forEach((_, i) => {
			countNumberOfGroups++;

			let numberOfUsersByGroup = usersPerTeam;
			membersWithoutTeam -= usersPerTeam;

			if (countNumberOfGroups === maxTeams && membersWithoutTeam !== 0)
				numberOfUsersByGroup += membersWithoutTeam;

			const indexToCompare = i - 1 < 0 ? 0 : i - 1;

			availableUsers = availableUsers.filter((user) => {
				return !splitUsers[indexToCompare].find((member) => {
					return member.user === (user.user as User)._id;
				});
			});

			splitUsers[i] = this.getRandomGroup(numberOfUsersByGroup, availableUsers);
		});

		this.generateSubBoards(maxTeams, splitUsers, subBoards, responsibles);

		return subBoards;
	};

	generateSubBoards(
		maxTeams: number,
		splitUsers: BoardUserDto[][],
		subBoards: BoardDto[],
		responsibles: string[]
	) {
		new Array(maxTeams).fill(0).forEach((_, i) => {
			const newBoard = generateSubBoardDtoData(i + 1);
			const teamUsersWotIsNewJoiner = splitUsers[i].filter((user) => !user.isNewJoiner);

			const randomIndex = Math.floor(Math.random() * teamUsersWotIsNewJoiner.length);
			teamUsersWotIsNewJoiner[randomIndex].role = BoardRoles.RESPONSIBLE;
			responsibles.push(teamUsersWotIsNewJoiner[randomIndex].user.toString());

			const result = splitUsers[i].map(
				(user) => teamUsersWotIsNewJoiner.find((member) => member.user === user.user) || user
			);

			newBoard.users = result;
			subBoards.push(newBoard);
		});
	}
}
