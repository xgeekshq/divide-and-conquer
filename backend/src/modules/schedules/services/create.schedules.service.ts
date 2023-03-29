import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { getDay, getNextMonth } from 'src/libs/utils/dates';
import { CreateBoardServiceInterface } from 'src/modules/boards/interfaces/services/create.board.service.interface';
import { GetBoardServiceInterface } from 'src/modules/boards/interfaces/services/get.board.service.interface';
import * as BoardTypes from 'src/modules/boards/interfaces/types';
import Board from 'src/modules/boards/entities/board.schema';
import { ArchiveChannelDataOptions } from 'src/modules/communication/dto/types';
import { ArchiveChannelServiceInterface } from 'src/modules/communication/interfaces/archive-channel.service.interface';
import * as CommunicationTypes from 'src/modules/communication/interfaces/types';
import { AddCronJobDto } from '../dto/add.cronjob.dto';
import {
	AddCronJobType,
	CreateSchedulesServiceInterface
} from '../interfaces/services/create.schedules.service.interface';
import { DeleteSchedulesServiceInterface } from '../interfaces/services/delete.schedules.service.interface';
import { TYPES } from '../interfaces/types';
import Schedules from '../entities/schedules.schema';
import { Configs } from 'src/modules/boards/dto/configs.dto';
import { ScheduleRepositoryInterface } from '../repository/schedule.repository.interface';
import Team from 'src/modules/teams/entities/team.schema';

@Injectable()
export class CreateSchedulesService implements CreateSchedulesServiceInterface {
	private logger = new Logger(CreateSchedulesService.name);

	constructor(
		@Inject(forwardRef(() => TYPES.services.DeleteSchedulesService))
		private deleteSchedulesService: DeleteSchedulesServiceInterface,
		@Inject(forwardRef(() => BoardTypes.TYPES.services.CreateBoardService))
		private createBoardService: CreateBoardServiceInterface,
		@Inject(forwardRef(() => BoardTypes.TYPES.services.GetBoardService))
		private getBoardService: GetBoardServiceInterface,
		private schedulerRegistry: SchedulerRegistry,
		@Inject(CommunicationTypes.TYPES.services.SlackArchiveChannelService)
		private archiveChannelService: ArchiveChannelServiceInterface,
		@Inject(TYPES.repository.ScheduleRepository)
		private readonly scheduleRepository: ScheduleRepositoryInterface
	) {
		this.createInitialJobs();
	}

	private async createInitialJobs() {
		const schedules = await this.scheduleRepository.getSchedules();

		schedules.forEach(async (schedule) => {
			const date = new Date(schedule.willRunAt);
			const day = date.getUTCDate();
			const month = date.getUTCMonth();
			const hours = date.getUTCHours();
			const minutes = date.getUTCMinutes();
			await this.deleteSchedulesService.findAndDeleteScheduleByBoardId(String(schedule.board));
			await this.addCronJob({
				day,
				month,
				hours,
				minutes,
				addCronJobDto: this.mapScheduleDocumentToDto(schedule)
			});
		});
	}

	private mapScheduleDocumentToDto(schedule: Schedules): AddCronJobDto {
		return {
			boardId: String(schedule.board),
			teamId: String(schedule.team),
			ownerId: String(schedule.owner),
			maxUsersPerTeam: schedule.maxUsers
		};
	}

	async addCronJob(input: AddCronJobType) {
		const { day, month, addCronJobDto, hours = 10, minutes = 0 } = input;
		const { ownerId, teamId, boardId, maxUsersPerTeam } = addCronJobDto;

		const newMonth = month <= 0 ? 0 : month;

		try {
			const year =
				new Date().getUTCMonth() === 11 && newMonth === 0
					? new Date().getFullYear() + 1
					: new Date().getFullYear();

			const job = new CronJob(`${minutes} ${hours} ${day} ${newMonth} *`, () =>
				this.handleComplete(String(ownerId), teamId, String(boardId))
			);

			const cronJobDoc = await this.scheduleRepository.create({
				board: String(boardId),
				team: String(teamId),
				owner: String(ownerId),
				maxUsers: maxUsersPerTeam,
				willRunAt: new Date(year, newMonth, day, hours, minutes).toISOString()
			});

			if (!cronJobDoc) throw Error('CronJob not created');

			this.schedulerRegistry.addCronJob(String(boardId), job);
			job.start();
			this.logger.log(`Job created for ${boardId}`);
		} catch (e) {
			this.logger.error(e);
		}
	}

	async handleComplete(ownerId: string, teamId: string, oldBoardId: string) {
		try {
			const deletedSchedule = await this.deleteSchedulesService.findAndDeleteScheduleByBoardId(
				oldBoardId
			);

			const oldBoard = await this.getBoardService.getBoardPopulated(oldBoardId);

			if (!oldBoard) {
				await this.deleteSchedulesService.deleteScheduleByBoardId(oldBoardId);

				return;
			}

			if (oldBoard.slackEnable) {
				this.archiveChannelService.execute({
					type: ArchiveChannelDataOptions.BOARD,
					data: {
						id: oldBoard._id,
						slackChannelId: oldBoard.slackChannelId,
						dividedBoards: oldBoard.dividedBoards.map((i) => ({
							id: i._id,
							slackChannelId: i.slackChannelId
						}))
					},
					cascade: true
				});
			}

			if (!deletedSchedule) return;

			this.createSchedule(oldBoard, deletedSchedule, ownerId, teamId, oldBoardId);
		} catch (e) {
			this.logger.error(e);
		}
	}

	async createSchedule(
		oldBoard: Board,
		deletedSchedule: Schedules,
		ownerId: string,
		teamId: string,
		oldBoardId: string
	) {
		const day = getDay();
		let month = getNextMonth();
		month = month - 1 <= 0 ? 0 : month - 1;

		const configs: Configs = {
			recurrent: oldBoard.recurrent,
			maxVotes: oldBoard.maxVotes,
			hideCards: oldBoard.hideCards,
			hideVotes: oldBoard.hideVotes,
			postAnonymously: oldBoard.postAnonymously,
			maxUsersPerTeam: deletedSchedule.maxUsers,
			slackEnable: oldBoard.slackEnable ?? false,
			date: new Date(new Date().getFullYear(), month, day)
		};

		const team = oldBoard.team as Team;

		try {
			const boardId = await this.createBoardService.splitBoardByTeam(
				ownerId,
				teamId,
				configs,
				team.name
			);

			const addCronJobDto: AddCronJobDto = {
				ownerId,
				teamId,
				boardId: boardId ?? oldBoardId,
				maxUsersPerTeam: deletedSchedule.maxUsers
			};

			this.addCronJob({ day, month, addCronJobDto });
		} catch (e) {
			this.logger.error(e);
			await this.deleteSchedulesService.deleteScheduleByBoardId(oldBoardId);
		}
	}
}
