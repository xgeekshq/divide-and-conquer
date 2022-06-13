import BoardDto from '../../dto/board.dto';
import { BoardDocument } from '../../schemas/board.schema';

export interface Configs {
  recurrent: boolean;
  maxVotes?: string | null;
  votes?: string | null;
  hideCards?: boolean;
  hideVotes?: boolean;
  anonymously: boolean;
  maxUsers: number;
}

export interface CreateBoardService {
  create(boardData: BoardDto, userId: string): Promise<BoardDocument>;
  splitBoardByTeam(ownerId: string, teamId: string, configs: Configs);
}
