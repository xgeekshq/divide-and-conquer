import { LeanDocument } from 'mongoose';
import { BoardDocument } from '../../schemas/board.schema';
import { BoardsAndPage } from '../boards-page.interface';

export interface GetBoardApplicationInterface {
	getUserBoardsOfLast3Months(
		userId: string,
		page?: number,
		size?: number
	): Promise<BoardsAndPage | null>;

	getAllBoards(
		teamId?: string,
		userId?: string,
		isSuperAdmin?: boolean,
		personalBoards?: boolean,
		page?: number,
		size?: number
	): Promise<BoardsAndPage | null>;

	getBoard(
		boardId: string,
		userId: string
	): Promise<
		| { board: LeanDocument<BoardDocument> }
		| null
		| {
				board: LeanDocument<BoardDocument>;
				mainBoardData: LeanDocument<BoardDocument>;
		  }
		| null
	>;

	countBoards(userId: string): Promise<number>;

	getAllBoardIdsAndTeamIdsOfUser(
		userId: string
	): Promise<{ boardIds: LeanDocument<unknown>[]; teamIds: unknown[] }>;
}
