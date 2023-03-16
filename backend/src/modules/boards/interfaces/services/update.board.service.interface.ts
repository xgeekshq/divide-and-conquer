import BoardUserDto from 'src/modules/boardusers/dto/board.user.dto';
import { LeanDocument } from 'mongoose';
import { TeamDto } from 'src/modules/communication/dto/team.dto';
import { UpdateBoardDto } from '../../dto/update-board.dto';
import { BoardDocument } from '../../entities/board.schema';
import BoardUser from '../../../boardusers/entities/board.user.schema';
import { BoardPhaseDto } from 'src/libs/dto/board-phase.dto';

export interface UpdateBoardServiceInterface {
	update(boardId: string, boardData: UpdateBoardDto): Promise<LeanDocument<BoardDocument> | null>;

	mergeBoards(subBoardId: string, userId: string): Promise<LeanDocument<BoardDocument> | null>;
	updateChannelId(teams: TeamDto[]);

	updateBoardParticipants(
		addUsers: BoardUserDto[],
		removeUsers: string[]
	): Promise<BoardUser[] | null>;

	updateBoardParticipantsRole(boardUserToUpdate: BoardUserDto): Promise<BoardUser>;

	updatePhase(payload: BoardPhaseDto);
}
