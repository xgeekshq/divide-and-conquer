import { encrypt } from 'src/libs/utils/bcrypt';
import { faker } from '@faker-js/faker';
import { UserFactory } from 'src/libs/test-utils/mocks/factories/user-factory';
import { GetUserServiceInterface } from 'src/modules/users/interfaces/services/get.user.service.interface';
import { UserRepositoryInterface } from './../repository/user.repository.interface';
import { getUserService } from './../users.providers';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import * as Users from 'src/modules/users/interfaces/types';
import User from '../entities/user.schema';

const user: User = UserFactory.create();
const refreshToken = faker.datatype.string();

describe('GetUserService', () => {
	let userService: GetUserServiceInterface;
	let userRepositoryMock: DeepMocked<UserRepositoryInterface>;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				getUserService,
				{
					provide: Users.TYPES.repository,
					useValue: createMock<UserRepositoryInterface>()
				}
			]
		}).compile();

		userService = module.get<GetUserServiceInterface>(getUserService.provide);
		userRepositoryMock = module.get(Users.TYPES.repository);
	});

	beforeEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(userService).toBeDefined();
	});

	describe('getUserIfRefreshTokenMatches', () => {
		it('returns false if user is not found', async () => {
			userRepositoryMock.getById.mockResolvedValue(null);
			await expect(
				userService.getUserIfRefreshTokenMatches(refreshToken, user._id)
			).resolves.toEqual(false);
		});

		it('returns false if user has no currentRefreshToken', async () => {
			userRepositoryMock.getById.mockResolvedValue(user);
			await expect(
				userService.getUserIfRefreshTokenMatches(refreshToken, user._id)
			).resolves.toEqual(false);
		});

		it('returns false if refresh token is not matching', async () => {
			userRepositoryMock.getById.mockResolvedValue(user);
			await expect(
				userService.getUserIfRefreshTokenMatches(refreshToken, user._id)
			).resolves.toEqual(false);
		});

		it('returns user if refresh token is matching', async () => {
			user.currentHashedRefreshToken = await encrypt(refreshToken);
			userRepositoryMock.getById.mockResolvedValue(user);
			await expect(
				userService.getUserIfRefreshTokenMatches(refreshToken, user._id)
			).resolves.toEqual(user);
		});
	});
});
