import BoardTimerDurationDto from 'src/modules/common/dtos/board-timer-duration.dto';

export default interface UpdateBoardTimerDurationService {
	updateDuration(boardTimerDurationDto: BoardTimerDurationDto): void;
}
