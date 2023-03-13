import { DeleteUserUseCaseInterface } from '../interfaces/applications/delete-user.use-case.interface';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TYPES } from '../interfaces/types';
import * as TeamUser from 'src/modules/teams/interfaces/types';
import UserDto from '../dto/user.dto';
import { DELETE_FAILED } from 'src/libs/exceptions/messages';
import { DeleteTeamUserServiceInterface } from 'src/modules/teams/interfaces/services/delete.team.user.service.interface';
import { GetTeamServiceInterface } from 'src/modules/teams/interfaces/services/get.team.service.interface';
import { UserRepositoryInterface } from '../repository/user.repository.interface';

@Injectable()
export class DeleteUserUseCase implements DeleteUserUseCaseInterface {
	constructor(
		@Inject(TYPES.repository) private readonly userRepository: UserRepositoryInterface,
		@Inject(TeamUser.TYPES.services.GetTeamService)
		private getTeamUserService: GetTeamServiceInterface,
		@Inject(TeamUser.TYPES.services.DeleteTeamUserService)
		private teamUserService: DeleteTeamUserServiceInterface
	) {}

	async execute(user: UserDto, userId: string) {
		if (user._id == userId) {
			throw new BadRequestException(DELETE_FAILED);
		}

		await this.userRepository.startTransaction();

		try {
			await this.deleteUser(userId, true);
			const teamsOfUser = await this.getTeamUserService.getTeamsOfUser(userId);

			if (teamsOfUser.length > 0) {
				await this.teamUserService.delete(userId);
			}
			await this.userRepository.commitTransaction();

			return true;
		} catch (e) {
			await this.userRepository.abortTransaction();
		} finally {
			await this.userRepository.endSession();
		}
		throw new BadRequestException(DELETE_FAILED);
	}

	private async deleteUser(userId: string, withSession: boolean) {
		const result = await this.userRepository.deleteUser(userId, withSession);

		if (!result) throw new NotFoundException(DELETE_FAILED);
	}
}
