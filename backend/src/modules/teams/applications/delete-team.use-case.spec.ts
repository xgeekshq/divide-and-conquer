import { TeamFactory } from 'src/libs/test-utils/mocks/factories/team-factory.mock';
import Team from 'src/modules/teams/entities/team.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { deleteTeamUseCase } from 'src/modules/teams/providers';
import * as TeamUsers from 'src/modules/teamUsers/interfaces/types';
import * as Boards from 'src/modules/boards/interfaces/types';
import { BadRequestException } from '@nestjs/common';
import { TeamRepositoryInterface } from '../interfaces/repositories/team.repository.interface';
import { TEAM_REPOSITORY } from 'src/modules/teams/constants';
import { UseCase } from 'src/libs/interfaces/use-case.interface';
import { DeleteTeamUserServiceInterface } from 'src/modules/teamUsers/interfaces/services/delete.team.user.service.interface';
import { DeleteBoardServiceInterface } from 'src/modules/boards/interfaces/services/delete.board.service.interface';
import { User } from '@slack/web-api/dist/response/AdminAppsRequestsListResponse';
import { TeamUserFactory } from 'src/libs/test-utils/mocks/factories/teamUser-factory.mock';
import { UserFactory } from 'src/libs/test-utils/mocks/factories/user-factory';
import TeamUser from 'src/modules/teamUsers/entities/team.user.schema';

const teams: Team[] = TeamFactory.createMany(4);
const teamUsers: TeamUser[] = TeamUserFactory.createMany(5);
const users: User[] = UserFactory.createMany(5);
const usersWithId = users.map((user, idx) => ({
	_id: teamUsers[idx]._id,
	...user
}));
const teamUsersWithUsers = teamUsers.map((teamUser, idx) => ({
	...teamUser,
	user: usersWithId[idx]
}));
const team1 = {
	...teams[0],
	users: teamUsersWithUsers
} as Team;

describe('DeleteTeamUseCase', () => {
	let deleteTeam: UseCase<string, boolean>;
	let teamRepositoryMock: DeepMocked<TeamRepositoryInterface>;
	let deleteTeamUserServiceMock: DeepMocked<DeleteTeamUserServiceInterface>;
	let deleteBoardServiceMock: DeepMocked<DeleteBoardServiceInterface>;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				deleteTeamUseCase,
				{
					provide: TEAM_REPOSITORY,
					useValue: createMock<TeamRepositoryInterface>()
				},
				{
					provide: TeamUsers.TYPES.services.DeleteTeamUserService,
					useValue: createMock<DeleteTeamUserServiceInterface>()
				},
				{
					provide: Boards.TYPES.services.DeleteBoardService,
					useValue: createMock<DeleteBoardServiceInterface>()
				}
			]
		}).compile();

		deleteTeam = module.get<UseCase<string, boolean>>(deleteTeamUseCase.provide);
		teamRepositoryMock = module.get(TEAM_REPOSITORY);
		deleteTeamUserServiceMock = module.get(TeamUsers.TYPES.services.DeleteTeamUserService);
		deleteBoardServiceMock = module.get(Boards.TYPES.services.DeleteBoardService);
	});

	beforeEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();

		teamRepositoryMock.findOneAndRemoveByField.mockResolvedValue(team1);
		deleteTeamUserServiceMock.deleteTeamUsersOfTeam.mockResolvedValue(true);
		deleteBoardServiceMock.deleteBoardsByTeamId.mockResolvedValue(true);
	});

	it('should be defined', () => {
		expect(deleteTeam).toBeDefined();
	});

	describe('execute', () => {
		it('should return true', async () => {
			await expect(deleteTeam.execute(team1._id)).resolves.toEqual(true);
		});

		it('should throw BadRequest when team not deleted', async () => {
			teamRepositoryMock.findOneAndRemoveByField.mockResolvedValue(null);

			await expect(deleteTeam.execute(team1._id)).rejects.toThrowError(BadRequestException);
		});

		it('should throw BadRequest when teamUsers not deleted', async () => {
			deleteTeamUserServiceMock.deleteTeamUsersOfTeam.mockRejectedValue(BadRequestException);

			await expect(deleteTeam.execute(team1._id)).rejects.toThrowError(BadRequestException);
		});

		it('should throw BadRequest when boards not deleted', async () => {
			deleteBoardServiceMock.deleteBoardsByTeamId.mockRejectedValue(BadRequestException);

			await expect(deleteTeam.execute(team1._id)).rejects.toThrowError(BadRequestException);
		});

		it('should throw BadRequest when teamRepository.commitTransaction fails', async () => {
			teamRepositoryMock.commitTransaction.mockRejectedValue(Error);

			await expect(deleteTeam.execute(team1._id)).rejects.toThrowError(BadRequestException);
		});

		it('should throw BadRequest when deleteTeamUserService.commitTransaction fails', async () => {
			deleteTeamUserServiceMock.commitTransaction.mockRejectedValue(Error);

			await expect(deleteTeam.execute(team1._id)).rejects.toThrowError(BadRequestException);
		});
	});
});
