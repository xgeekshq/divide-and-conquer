import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UseCase } from 'src/libs/interfaces/use-case.interface';
import { GetCardServiceInterface } from '../interfaces/services/get.card.service.interface';
import { CardRepositoryInterface } from '../repository/card.repository.interface';
import { TYPES } from '../interfaces/types';
import MergeCardUseCaseDto from '../dto/useCase/merge-card.use-case.dto';
import { CARD_NOT_FOUND, CARD_NOT_REMOVED, UPDATE_FAILED } from 'src/libs/exceptions/messages';

@Injectable()
export class MergeCardUseCase implements UseCase<MergeCardUseCaseDto, boolean> {
	constructor(
		@Inject(TYPES.services.GetCardService)
		private readonly getCardService: GetCardServiceInterface,
		@Inject(TYPES.repository.CardRepository)
		private readonly cardRepository: CardRepositoryInterface
	) {}

	async execute(mergeCardUseCaseDto: MergeCardUseCaseDto) {
		const { boardId, draggedCardId, targetCardId } = mergeCardUseCaseDto;
		await this.cardRepository.startTransaction();
		try {
			const cardToMove = await this.getCardService.getCardFromBoard(boardId, draggedCardId);

			if (!cardToMove) return null;

			const pullResult = await this.cardRepository.pullCard(boardId, draggedCardId, true);

			if (pullResult.modifiedCount !== 1) throw Error(CARD_NOT_REMOVED);

			const cardGroup = await this.getCardService.getCardFromBoard(boardId, targetCardId);

			if (!cardGroup) throw Error(CARD_NOT_FOUND);

			const { items, comments, votes } = cardToMove;
			const newItems = cardGroup.items.concat(items);

			const newVotes = (cardGroup.votes as unknown as string[]).concat(
				votes as unknown as string[]
			);

			const newComments = cardGroup.comments.concat(comments);

			const updateCard = await this.cardRepository.updateCardOnMerge(
				boardId,
				targetCardId,
				newItems,
				newVotes,
				newComments,
				true
			);

			if (!updateCard) throw Error(UPDATE_FAILED);
			await this.cardRepository.commitTransaction();

			return true;
		} catch (e) {
			await this.cardRepository.abortTransaction();
		} finally {
			await this.cardRepository.endSession();
		}

		throw new BadRequestException(UPDATE_FAILED);
	}
}
