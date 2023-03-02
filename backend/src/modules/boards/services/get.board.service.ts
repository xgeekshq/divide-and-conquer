import { CreateBoardUserServiceInterface } from './../interfaces/services/create.board.user.service.interface';
import TeamUser from 'src/modules/teams/entities/team.user.schema';
import Team from 'src/modules/teams/entities/teams.schema';
import { UserRepositoryInterface } from './../../users/repository/user.repository.interface';
import {
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
	forwardRef
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BOARDS_NOT_FOUND, FORBIDDEN, NOT_FOUND } from 'src/libs/exceptions/messages';
import { GetTeamServiceInterface } from 'src/modules/teams/interfaces/services/get.team.service.interface';
import * as Teams from 'src/modules/teams/interfaces/types';
import * as Users from 'src/modules/users/interfaces/types';
import * as Boards from 'src/modules/boards/interfaces/types';
import * as Auth from 'src/modules/auth/interfaces/types';
import { QueryType } from '../interfaces/findQuery';
import { GetBoardServiceInterface } from '../interfaces/services/get.board.service.interface';
import Board, { BoardDocument } from '../entities/board.schema';
import BoardUser, { BoardUserDocument } from '../entities/board.user.schema';
import { cleanBoard } from '../utils/clean-board';
import { BoardDataPopulate, GetBoardDataPopulate } from '../utils/populate-board';
import { GetTokenAuthService } from 'src/modules/auth/interfaces/services/get-token.auth.service.interface';
import { LoginGuestUserResponse } from 'src/libs/dto/response/login-guest-user.response';
import { TeamRoles } from 'src/libs/enum/team.roles';
import User from 'src/modules/users/entities/user.schema';

@Injectable()
export default class GetBoardServiceImpl implements GetBoardServiceInterface {
	constructor(
		@InjectModel(Board.name) private boardModel: Model<BoardDocument>,
		@InjectModel(BoardUser.name)
		private boardUserModel: Model<BoardUserDocument>,
		@Inject(forwardRef(() => Teams.TYPES.services.GetTeamService))
		private getTeamService: GetTeamServiceInterface,
		@Inject(Users.TYPES.repository)
		private readonly userRepository: UserRepositoryInterface,
		@Inject(Boards.TYPES.services.CreateBoardUserService)
		private createBoardUserService: CreateBoardUserServiceInterface,
		@Inject(Auth.TYPES.services.GetTokenAuthService)
		private getTokenAuthService: GetTokenAuthService
	) {}

	private readonly logger = new Logger(GetBoardServiceImpl.name);

	getAllBoardsIdsOfUser(userId: string) {
		return this.boardUserModel.find({ user: userId }).select('board').lean().exec();
	}

	async getAllBoardIdsAndTeamIdsOfUser(userId: string) {
		const [boardIds, teamIds] = await Promise.all([
			this.getAllBoardsIdsOfUser(userId),
			this.getTeamService.getTeamsOfUser(userId)
		]);

		return {
			boardIds: boardIds.map((boardUser) => boardUser.board),
			teamIds: teamIds.map((team) => team._id)
		};
	}

	async getUserBoardsOfLast3Months(userId: string, page: number, size?: number) {
		const { boardIds, teamIds } = await this.getAllBoardIdsAndTeamIdsOfUser(userId);

		const now = new Date();
		const last3Months = new Date().setMonth(now.getMonth() - 3);
		const query = {
			$and: [
				{ isSubBoard: false, updatedAt: { $gte: last3Months } },
				{ $or: [{ _id: { $in: boardIds } }, { team: { $in: teamIds } }] }
			]
		};

		return this.getBoards(false, query, page, size);
	}

	async getSuperAdminBoards(userId: string, page: number, size?: number) {
		const { boardIds } = await this.getAllBoardIdsAndTeamIdsOfUser(userId);

		const query = {
			$and: [{ isSubBoard: false }, { $or: [{ _id: { $in: boardIds } }, { team: { $ne: null } }] }]
		};

		return this.getBoards(false, query, page, size);
	}

	async getUsersBoards(userId: string, page: number, size?: number) {
		const { boardIds, teamIds } = await this.getAllBoardIdsAndTeamIdsOfUser(userId);

		const query = {
			$and: [
				{ isSubBoard: false },
				{ $or: [{ _id: { $in: boardIds } }, { team: { $in: teamIds } }] }
			]
		};

		return this.getBoards(false, query, page, size);
	}

	getTeamBoards(teamId: string, page: number, size?: number) {
		const query = {
			$and: [{ isSubBoard: false }, { $or: [{ team: teamId }] }]
		};

		return this.getBoards(false, query, page, size);
	}

	async getPersonalUserBoards(userId: string, page: number, size?: number) {
		const { boardIds } = await this.getAllBoardIdsAndTeamIdsOfUser(userId);

		const query = {
			$and: [{ isSubBoard: false }, { team: null }, { _id: { $in: boardIds } }]
		};

		return this.getBoards(false, query, page, size);
	}

	async getBoards(allBoards: boolean, query: QueryType, page = 0, size = 10) {
		const count = await this.boardModel.find(query).countDocuments().exec();
		const hasNextPage = page + 1 < Math.ceil(count / (allBoards ? count : size));
		try {
			const boards = await this.boardModel
				.find(query)
				.sort({ updatedAt: 'desc' })
				.skip(allBoards ? 0 : page * size)
				.limit(allBoards ? count : size)
				.select(
					'-__v -createdAt -slackEnable -slackChannelId -submitedByUser -submitedAt -columns.id -columns._id -columns.cards.text -columns.cards.createdBy -columns.cards.items.text -columns.cards.items.createdBy -columns.cards.createdAt -columns.cards.items.createdAt -columns.cards._id -columns.cards.id -columns.cards.items._id -columns.cards.items.id -columns.cards.createdByTeam -columns.cards.items.createdByTeam -columns.cards.items.votes -columns.cards.items.comments -columns.cards.votes -columns.cards.comments'
				)
				.populate({ path: 'createdBy', select: 'firstName lastName' })
				.populate({
					path: 'team',
					select: 'name users _id',
					populate: {
						path: 'users',
						select: 'user role',
						populate: {
							path: 'user',
							select: '_id firstName lastName joinedAt'
						}
					}
				})
				.populate({
					path: 'dividedBoards',
					select:
						'-__v -createdAt -slackEnable -slackChannelId -submitedAt -id -columns.id -submitedByUser -columns._id -columns.cards.text -columns.cards.createdBy -columns.cards.items.text -columns.cards.items.createdBy -columns.cards.createdAt -columns.cards.items.createdAt -columns.cards._id -columns.cards.id -columns.cards.items._id -columns.cards.items.id -columns.cards.createdByTeam -columns.cards.items.createdByTeam -columns.cards.items.votes -columns.cards.items.comments -columns.cards.votes -columns.cards.comments',
					populate: [
						{
							path: 'users',
							select: 'role user',
							populate: {
								path: 'user',
								model: 'User',
								select: 'firstName email lastName'
							}
						}
					]
				})
				.populate({
					path: 'users',
					select: 'user role -board',
					populate: {
						path: 'user',
						select: '_id firstName email lastName isAnonymous'
					}
				})
				.lean({ virtuals: true })
				.exec();

			return { boards: boards ?? [], hasNextPage, page };
		} catch (e) {
			this.logger.error(BOARDS_NOT_FOUND);
		}

		return { boards: [], hasNextPage, page };
	}

	async getBoardFromRepo(boardId: string) {
		const board = await this.boardModel
			.findById(boardId)
			.populate(BoardDataPopulate)
			.lean({ virtuals: true })
			.exec();

		return board as Board;
	}

	async getMainBoardData(boardId: string) {
		const mainBoard = await this.boardModel
			.findOne({ dividedBoards: { $in: boardId } })
			.select('dividedBoards team title')
			.populate({
				path: 'dividedBoards',
				select: '_id title'
			})
			.populate({
				path: 'team',
				select: 'name users _id',
				populate: {
					path: 'users',
					select: 'user role',
					populate: {
						path: 'user',
						select: 'firstName email lastName joinedAt'
					}
				}
			})
			.lean({ virtuals: true })
			.exec();

		return mainBoard;
	}

	async getMainBoard(boardId: string) {
		const mainBoard = await this.boardModel
			.findOne({ dividedBoards: { $in: boardId } })
			.select('title')
			.lean()
			.exec();

		return mainBoard;
	}

	/**
	 *
	 * @param boardId
	 * @param userId
	 * @returns board when
	 * 			* board is private
	 * 				- user is a board user
	 * 				- user is team admin, stakeholder or super admin
	 *			* board is public
	 *				- user is signed in but not a board user (creates board user when use isn't a Super Admin )
	 *				- user is a guest but not a board user (creates board user): also returns accessToken
	 *				- user is a board user
	 */
	async getBoard(boardId: string, userId: string) {
		let board = await this.getBoardData(boardId);

		if (!board) throw new NotFoundException(NOT_FOUND);

		const userFound = await this.userRepository.getById(userId);

		if (!userFound) throw new NotFoundException(NOT_FOUND);

		const { guestUser, canSeeBoard } = await this.checkIfUserCanSeeBoardAndCreatePublicBoardUsers(
			board,
			userFound
		);

		if (!canSeeBoard) throw new ForbiddenException(FORBIDDEN);

		board = cleanBoard(board, userFound._id);

		if (board.isSubBoard) {
			const mainBoard = await this.getMainBoard(boardId);

			return { board, mainBoard };
		}

		if (guestUser) return { guestUser, board };

		return { board };
	}

	private async getBoardUsers(board: string, user: string) {
		return this.boardUserModel.find({ board, user });
	}

	private async createBoardUserAndSendAccessToken(
		board: string,
		user: string
	): Promise<LoginGuestUserResponse> {
		const { accessToken } = await this.getTokenAuthService.getTokens(user);
		this.userRepository.findOneByFieldAndUpdate({ _id: user }, { $set: { updatedAt: new Date() } });

		await this.createBoardUserService.createBoardUser(board, user);

		return { accessToken, user };
	}

	private async checkIfUserCanSeeBoardAndCreatePublicBoardUsers(board: Board, user: User) {
		const boardUserFound = await this.getBoardUsers(board._id, user._id);
		let guestUser: LoginGuestUserResponse;

		if (!boardUserFound.length) {
			if (board.isPublic) guestUser = await this.createPublicBoardUsers(board._id, user);
			else {
				const hasPermissions = this.isAllowedToSeePrivateBoard(board, user);

				if (!hasPermissions) return { canSeeBoard: hasPermissions };
			}
		}

		return { guestUser, canSeeBoard: true };
	}

	private createPublicBoardUsers(boardId: string, user: User) {
		// if signed in user accesses the board but isn't a board user, create one
		if (!user.isAnonymous) {
			// Super Admin shouldn't automatically be added to the board as a boardUser
			if (!user.isSAdmin) this.createBoardUserService.createBoardUser(boardId, user._id);

			return;
		}

		// if guest user is already registered but isn't a board user, create one
		return this.createBoardUserAndSendAccessToken(boardId, user._id);
	}

	private isAllowedToSeePrivateBoard(board: Board, user: User) {
		const teamUser = (board.team as Team).users.find(
			(teamUser: TeamUser) => (teamUser.user as User)._id.toString() === user._id.toString()
		);

		return (
			!user.isAnonymous &&
			(user.isSAdmin || (TeamRoles.ADMIN, TeamRoles.STAKEHOLDER).includes(teamUser.role))
		);
	}

	async countBoards(userId: string) {
		const { boardIds, teamIds } = await this.getAllBoardIdsAndTeamIdsOfUser(userId);

		return this.boardModel.countDocuments({
			$and: [
				{ isSubBoard: false },
				{ $or: [{ _id: { $in: boardIds } }, { team: { $in: teamIds } }] }
			]
		});
	}

	async getBoardData(boardId: string) {
		const board = await this.boardModel
			.findById(boardId)
			.select('-slackEnable -slackChannelId -recurrent -__v')
			.populate(GetBoardDataPopulate)
			.lean({ virtuals: true })
			.exec();

		return board as Board;
	}

	getAllBoardsByTeamId(teamId: string) {
		return this.boardModel.find({ team: teamId }).select('board').lean().exec();
	}
}
