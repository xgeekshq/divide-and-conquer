import { BoardUserRoles } from 'utils/enums/board.user.roles';
import { User } from '../user/user';

export interface BoardUser {
	id: any;
	user: User;
	role: BoardUserRoles;
	_id: string;
	votesCount: number;
}

export interface BoardUserNoPopulated {
	_id: string;
	board: string;
	role: string;
	user: string;
}

export interface BoardUserToAdd {
	user: User;
	role: BoardUserRoles;
	votesCount: number;
}

export interface BoardUserDto {
	user: string;
	role: BoardUserRoles;
}
