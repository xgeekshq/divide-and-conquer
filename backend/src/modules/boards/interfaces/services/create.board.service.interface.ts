import BoardDto from '../../dto/board.dto';
import Board from '../../entities/board.schema';

export interface Configs {
	recurrent: boolean;
	maxVotes?: number | null;
	hideCards?: boolean;
	hideVotes?: boolean;
	maxUsersPerTeam: number;
	slackEnable?: boolean;
	date?: Date;
	postAnonymously: boolean;
}

export interface CreateBoardService {
	create(boardData: BoardDto, userId: string): Promise<Board>;

	splitBoardByTeam(ownerId: string, teamId: string, configs: Configs): Promise<string | null>;
}
