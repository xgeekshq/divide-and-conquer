import { LeanDocument } from 'mongoose';
import { BoardDocument } from 'src/modules/boards/schemas/board.schema';

export interface DeleteCommentApplication {
	deleteItemComment(
		boardId: string,
		commentId: string,
		userId: string
	): Promise<LeanDocument<BoardDocument> | null>;

	deleteCardGroupComment(
		boardId: string,
		commentId: string,
		userId: string
	): Promise<LeanDocument<BoardDocument> | null>;
}
