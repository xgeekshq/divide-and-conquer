import { LeanDocument } from 'mongoose';
import { UpdateBoardDto } from '../../dto/update-board.dto';
import Board, { BoardDocument } from '../../entities/board.schema';
import BoardUser from '../../entities/board.user.schema';
import UpdateBoardUserDto from 'src/modules/boards/dto/update-board-user.dto';
import { BoardPhaseDto } from 'src/libs/dto/board-phase.dto';

export interface UpdateBoardApplicationInterface {
	update(boardId: string, boardData: UpdateBoardDto): Promise<Board>;

	mergeBoards(
		subBoardId: string,
		userId: string,
		socketId?: string
	): Promise<LeanDocument<BoardDocument> | null>;

	updateBoardParticipants(boardData: UpdateBoardUserDto): Promise<BoardUser[] | BoardUser | null>;

	updatePhase(payload: BoardPhaseDto);
}
