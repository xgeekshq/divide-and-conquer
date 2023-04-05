import { Inject, Injectable, Logger } from '@nestjs/common';
import { TYPES } from '../interfaces/types';
import * as BoardUsers from 'src/modules/boardUsers/interfaces/types';
import { UseCase } from 'src/libs/interfaces/use-case.interface';
import { CreateVoteServiceInterface } from '../interfaces/services/create.vote.service.interface';
import { UpdateBoardUserServiceInterface } from 'src/modules/boardUsers/interfaces/services/update.board.user.service.interface';
import { InsertFailedException } from 'src/libs/exceptions/insertFailedBadRequestException';
import { INSERT_VOTE_FAILED } from 'src/libs/exceptions/messages';
import { WRITE_LOCK_ERROR } from 'src/libs/constants/database';
import { VoteRepositoryInterface } from '../interfaces/repositories/vote.repository.interface';
import CardItemVoteUseCaseDto from '../dto/useCase/card-item-vote.use-case.dto';
import { DeleteVoteServiceInterface } from '../interfaces/services/delete.vote.service.interface';

@Injectable()
export class CardItemVoteUseCase implements UseCase<CardItemVoteUseCaseDto, void> {
	private logger: Logger = new Logger('CreateVoteService');
	constructor(
		@Inject(TYPES.services.CreateVoteService)
		private readonly createVoteService: CreateVoteServiceInterface,
		@Inject(TYPES.services.DeleteVoteService)
		private readonly deleteVoteService: DeleteVoteServiceInterface,
		@Inject(TYPES.repositories.VoteRepository)
		private readonly voteRepository: VoteRepositoryInterface,
		@Inject(BoardUsers.TYPES.services.UpdateBoardUserService)
		private readonly updateBoardUserService: UpdateBoardUserServiceInterface
	) {}

	async execute({ boardId, cardId, userId, cardItemId, count }: CardItemVoteUseCaseDto) {
		if (count < 0) {
			await this.deleteVoteService.deleteVoteFromCard(boardId, cardId, userId, cardItemId, count);
		} else {
			await this.addVoteToCardAndUser(boardId, cardId, userId, cardItemId, count);
		}
	}

	private async addVoteToCardAndUser(
		boardId: string,
		cardId: string,
		userId: string,
		cardItemId: string,
		count: number,
		retryCount?: number
	) {
		await this.createVoteService.canUserVote(boardId, userId, count);

		await this.updateBoardUserService.startTransaction();
		await this.voteRepository.startTransaction();

		try {
			await this.addVoteToCardAndUserOperations(
				boardId,
				userId,
				count,
				cardId,
				cardItemId,
				retryCount
			);
			await this.updateBoardUserService.commitTransaction();
			await this.voteRepository.commitTransaction();
		} catch (e) {
			throw new InsertFailedException(INSERT_VOTE_FAILED);
		} finally {
			await this.updateBoardUserService.endSession();
			await this.voteRepository.endSession();
		}
	}

	private async addVoteToCardAndUserOperations(
		boardId: string,
		userId: string,
		count: number,
		cardId: string,
		cardItemId: string,
		retryCount?: number
	) {
		let retryCountOperation = retryCount ?? 0;
		const withSession = true;
		try {
			await this.createVoteService.incrementVoteUser(boardId, userId, count, withSession);

			const votes = Array(count).fill(userId);

			const updatedBoard = await this.voteRepository.insertCardItemVote(
				boardId,
				cardId,
				cardItemId,
				votes,
				withSession
			);

			if (!updatedBoard) throw new InsertFailedException(INSERT_VOTE_FAILED);
		} catch (e) {
			this.logger.error(e);
			await this.updateBoardUserService.abortTransaction();
			await this.voteRepository.abortTransaction();

			if (e.code === WRITE_LOCK_ERROR && retryCountOperation < 5) {
				retryCountOperation++;
				await this.updateBoardUserService.endSession();
				await this.voteRepository.endSession();
				await this.addVoteToCardAndUser(
					boardId,
					cardId,
					userId,
					cardItemId,
					count,
					retryCountOperation
				);
			} else {
				throw new InsertFailedException(INSERT_VOTE_FAILED);
			}
		}
	}
}
