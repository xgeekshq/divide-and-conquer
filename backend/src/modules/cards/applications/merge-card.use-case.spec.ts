import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { CardRepositoryInterface } from '../repository/card.repository.interface';
import { CARD_REPOSITORY, GET_CARD_SERVICE } from '../constants';
import { GetCardServiceInterface } from '../interfaces/services/get.card.service.interface';
import MergeCardUseCaseDto from '../dto/useCase/merge-card.use-case.dto';
import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';
import { CardFactory } from 'src/libs/test-utils/mocks/factories/card-factory.mock';
import { UpdateResult } from 'mongodb';
import { CardItemFactory } from 'src/libs/test-utils/mocks/factories/cardItem-factory.mock';
import { UseCase } from 'src/libs/interfaces/use-case.interface';
import { MergeCardUseCase } from 'src/modules/cards/applications/merge-card.use-case';

const mergeCardDtoMock: MergeCardUseCaseDto = {
	boardId: faker.string.uuid(),
	draggedCardId: faker.string.uuid(),
	targetCardId: faker.string.uuid()
};
const cardMock = CardFactory.createMany(2, [
	{ items: CardItemFactory.createMany(1) },
	{ items: CardItemFactory.createMany(1) }
]);
const updateResult: UpdateResult = {
	acknowledged: true,
	matchedCount: 1,
	modifiedCount: 1,
	upsertedCount: 1,
	upsertedId: null
};

describe('MergeCardUseCase', () => {
	let useCase: UseCase<MergeCardUseCaseDto, boolean>;
	let cardRepositoryMock: DeepMocked<CardRepositoryInterface>;
	let getCardServiceMock: DeepMocked<GetCardServiceInterface>;
	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MergeCardUseCase,
				{
					provide: GET_CARD_SERVICE,
					useValue: createMock<GetCardServiceInterface>()
				},
				{
					provide: CARD_REPOSITORY,
					useValue: createMock<CardRepositoryInterface>()
				}
			]
		}).compile();
		useCase = module.get(MergeCardUseCase);
		getCardServiceMock = module.get(GET_CARD_SERVICE);
		cardRepositoryMock = module.get(CARD_REPOSITORY);

		getCardServiceMock.getCardFromBoard
			.mockResolvedValue(cardMock[0])
			.mockResolvedValue(cardMock[1]);
		cardRepositoryMock.pullCard.mockResolvedValue(updateResult);
	});

	beforeEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it('should be defined', () => {
		expect(useCase).toBeDefined();
	});
	it('should ', async () => {
		await useCase.execute(mergeCardDtoMock);
		await expect(cardRepositoryMock.updateCardOnMerge).toHaveBeenNthCalledWith(
			1,
			mergeCardDtoMock.boardId,
			mergeCardDtoMock.targetCardId,
			expect.anything(),
			expect.anything(),
			expect.anything(),
			true
		);
	});

	it('should throw badRequest if getCardFromBoard not found', async () => {
		getCardServiceMock.getCardFromBoard.mockResolvedValueOnce(null);
		await expect(useCase.execute(mergeCardDtoMock)).rejects.toThrow(BadRequestException);
	});

	it('should throw badRequest if repository pullCard not found', async () => {
		cardRepositoryMock.pullCard.mockResolvedValueOnce(null);
		await expect(useCase.execute(mergeCardDtoMock)).rejects.toThrow(BadRequestException);
	});

	it('should throw badRequest if getCardFromBoard not found', async () => {
		getCardServiceMock.getCardFromBoard
			.mockResolvedValueOnce(cardMock[0])
			.mockResolvedValueOnce(null);
		await expect(useCase.execute(mergeCardDtoMock)).rejects.toThrow(BadRequestException);
	});

	it('should throw badRequest if pullResult.modifiedCount different then 1', async () => {
		updateResult.modifiedCount = 2;
		await expect(useCase.execute(mergeCardDtoMock)).rejects.toThrow(BadRequestException);
		updateResult.modifiedCount = 1;
	});

	it('should throw badRequest if updateCardMerge fails', async () => {
		cardRepositoryMock.updateCardOnMerge.mockResolvedValue(null);
		await expect(useCase.execute(mergeCardDtoMock)).rejects.toThrow(BadRequestException);
	});

	it('should throw badRequest with default message when a non expected error occurs', async () => {
		cardRepositoryMock.updateCardOnMerge.mockRejectedValueOnce(Error);
		await expect(useCase.execute(mergeCardDtoMock)).rejects.toThrow(BadRequestException);
	});
});
