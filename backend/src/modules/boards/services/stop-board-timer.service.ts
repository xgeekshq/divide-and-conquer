import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BOARD_TIMER_SERVER_STOPPED } from 'src/libs/constants/timer';
import BoardTimerDto from 'src/libs/dto/board-timer.dto';
import ServerStoppedTimerEvent from 'src/modules/boards/events/server-stopped-timer.event';
import StopBoardTimerServiceInterface from 'src/modules/boards/interfaces/services/stop-board-timer.service.interface';
import { BOARD_TIMER_REPOSITORY } from 'src/modules/boards/constants';
import { BoardTimerRepositoryInterface } from 'src/modules/boards/repositories/board-timer.repository.interface';

@Injectable()
export default class StopBoardTimerService implements StopBoardTimerServiceInterface {
	private logger: Logger = new Logger(StopBoardTimerService.name);

	constructor(
		@Inject(BOARD_TIMER_REPOSITORY)
		private readonly boardTimerRepository: BoardTimerRepositoryInterface,

		private readonly eventEmitter: EventEmitter2
	) {}

	stopTimer(boardTimerDto: BoardTimerDto) {
		this.logger.log(`Will stop timer. Board: "${boardTimerDto.boardId})"`);

		const boardTimer = this.boardTimerRepository.findBoardTimerByBoardId(boardTimerDto.boardId);

		if (!boardTimer?.timerHelper) {
			this.logger.warn(`Timer not found for board: "${boardTimerDto.boardId}"`);

			return;
		}

		if (boardTimer.timerHelper.isStopped) {
			this.logger.warn(`Timer already stopped for board: "${boardTimerDto.boardId}"`);

			return;
		}

		boardTimer.timerHelper.stop();

		this.eventEmitter.emit(
			BOARD_TIMER_SERVER_STOPPED,
			new ServerStoppedTimerEvent({ ...boardTimerDto, ...boardTimer.timerHelper.state })
		);
	}
}
