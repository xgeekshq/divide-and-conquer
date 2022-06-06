import ColumnType, { CreateColumn } from '../column';
import { Team } from '../team/team';
import { User } from '../user/user';
import { BoardUser, BoardUserDto, BoardUserToAdd } from './board.user';

export interface GetBoardResponse {
	board: BoardType;
	mainBoardData: {
		_id: string;
		id: string;
		title: string;
		team: Team;
		dividedBoards: {
			_id: string;
			title: string;
		};
	};
}

export default interface BoardType {
	_id: string;
	title: string;
	creationDate?: string;
	updatedAt: string;
	columns: ColumnType[];
	isPublic: boolean;
	password?: string;
	dividedBoards: BoardType[];
	recurrent: boolean;
	team: Team;
	users: BoardUser[];
	createdBy: User;
	socketId?: string;
	isSubBoard?: boolean;
	maxVotes?: string;
	hideCards: boolean;
	hideVotes: boolean;
	postAnonymously: boolean;
	submitedByUser?: string;
	submitedAt?: Date;
}

export interface BoardInfoType {
	board: BoardType;
	mainBoardData?: {
		_id: string;
		id: string;
		title: string;
		team: Team;
		dividedBoards: {
			_id: string;
			title: string;
		};
	};
}

export interface BoardToAdd
	extends Omit<
		BoardType,
		'_id' | 'columns' | 'team' | 'createdBy' | 'updatedAt' | 'dividedBoards' | 'users'
	> {
	columns: CreateColumn[];
	team: string | null;
	users: BoardUserToAdd[];
	dividedBoards: BoardToAdd[];
}

export interface CreateBoardDto extends Omit<BoardToAdd, 'dividedBoards' | 'users'> {
	dividedBoards: CreateBoardDto[];
	users: BoardUserDto[];
	maxUsers?: string;
}
