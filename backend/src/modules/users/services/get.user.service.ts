import { Inject, Injectable } from '@nestjs/common';
import { compare } from 'src/libs/utils/bcrypt';
import { GetTeamServiceInterface } from 'src/modules/teams/interfaces/services/get.team.service.interface';
import * as Team from 'src/modules/teams/interfaces/types';
import { GetUserService } from '../interfaces/services/get.user.service.interface';
import { UserWithTeams } from '../interfaces/type-user-with-teams';
import { TYPES } from '../interfaces/types';
import { UserRepositoryInterface } from '../repository/user.repository.interface';

@Injectable()
export default class GetUserServiceImpl implements GetUserService {
	constructor(
		@Inject(TYPES.repository)
		private readonly userRepository: UserRepositoryInterface,
		@Inject(Team.TYPES.services.GetTeamService)
		private getTeamService: GetTeamServiceInterface
	) {}

	getByEmail(email: string) {
		return this.userRepository.getByProp({ email });
	}

	getById(_id: string) {
		return this.userRepository.get(_id, '-password -currentHashedRefreshToken');
	}

	async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
		const user = await this.getById(userId);

		if (!user || !user.currentHashedRefreshToken) return false;

		const isRefreshTokenMatching = await compare(refreshToken, user.currentHashedRefreshToken);

		return isRefreshTokenMatching ? user : false;
	}

	countUsers() {
		return this.userRepository.countDocuments();
	}

	getAllUsers() {
		return this.userRepository.getAll('-password -currentHashedRefreshToken');
	}

	async getAllUsersWithTeams() {
		const users = await this.getAllUsers();
		const mappedUsers: UserWithTeams[] = users.map((userFound) => {
			return {
				user: userFound,
				teams: []
			};
		});
		const usersOnlyWithTeams = await this.getTeamService.getUsersOnlyWithTeams();
		const ids = new Set(usersOnlyWithTeams.map((userWithTeams) => String(userWithTeams.user.id)));

		return [...usersOnlyWithTeams, ...mappedUsers.filter((user) => !ids.has(String(user.user.id)))];
	}
}
