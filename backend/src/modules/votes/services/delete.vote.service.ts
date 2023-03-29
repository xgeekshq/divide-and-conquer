import { Inject, Injectable, Logger } from '@nestjs/common';
import { WRITE_LOCK_ERROR } from 'src/libs/constants/database';
import { DELETE_VOTE_FAILED } from 'src/libs/exceptions/messages';
import { arrayIdToString } from 'src/libs/utils/arrayIdToString';
import isEmpty from 'src/libs/utils/isEmpty';
import { GetCardServiceInterface } from 'src/modules/cards/interfaces/services/get.card.service.interface';
import * as Cards from 'src/modules/cards/interfaces/types';
import { DeleteVoteServiceInterface } from '../interfaces/services/delete.vote.service.interface';
import { TYPES } from '../interfaces/types';
import * as BoardUsers from 'src/modules/boardUsers/interfaces/types';
import * as Boards from 'src/modules/boards/interfaces/types';
import { VoteRepositoryInterface } from '../interfaces/repositories/vote.repository.interface';
import { UpdateBoardUserServiceInterface } from 'src/modules/boardUsers/interfaces/services/update.board.user.service.interface';
import { GetBoardUserServiceInterface } from 'src/modules/boardUsers/interfaces/services/get.board.user.service.interface';
import { DeleteFailedException } from 'src/libs/exceptions/deleteFailedBadRequestException';
import { UpdateFailedException } from 'src/libs/exceptions/updateFailedBadRequestException';
import { GetBoardServiceInterface } from 'src/modules/boards/interfaces/services/get.board.service.interface';
import Card from 'src/modules/cards/entities/card.schema';

@Injectable()
export default class DeleteVoteService implements DeleteVoteServiceInterface {
	constructor(
		@Inject(TYPES.repositories.VoteRepository)
		private readonly voteRepository: VoteRepositoryInterface,
		@Inject(BoardUsers.TYPES.services.GetBoardUserService)
		private getBoardUserService: GetBoardUserServiceInterface,
		@Inject(BoardUsers.TYPES.services.UpdateBoardUserService)
		private updateBoardUserService: UpdateBoardUserServiceInterface,
		@Inject(Cards.TYPES.services.GetCardService)
		private getCardService: GetCardServiceInterface,
		@Inject(Boards.TYPES.services.GetBoardService)
		private getBoardService: GetBoardServiceInterface
	) {}

	private logger: Logger = new Logger('DeleteVoteService');

	async decrementVoteUser(boardId: string, userId: string, count?: number, withSession?: boolean) {
		const updatedBoardUser = await this.updateBoardUserService.updateVoteUser(
			boardId,
			userId,
			count,
			withSession,
			true
		);

		if (!updatedBoardUser) throw new UpdateFailedException();
	}

	async deleteVoteFromCard(
		boardId: string,
		cardId: string,
		userId: string,
		cardItemId: string,
		count: number,
		retryCount?: number
	) {
		await this.canUserDeleteVote(boardId, userId, count, cardId, cardItemId);

		const cardItem = await this.getCardItemFromBoard(boardId, cardId, cardItemId);

		const votes = this.getVotesFromCardItem(cardItem.votes as string[], String(userId), count);

		await this.updateBoardUserService.startTransaction();
		await this.voteRepository.startTransaction();

		try {
			await this.removeVotesFromCardItemAndUserOperations(
				boardId,
				cardItemId,
				votes,
				cardId,
				count,
				userId,
				retryCount
			);

			await this.updateBoardUserService.commitTransaction();
			await this.voteRepository.commitTransaction();
		} catch (e) {
			this.logger.error(e);

			throw new DeleteFailedException(DELETE_VOTE_FAILED);
		} finally {
			await this.updateBoardUserService.endSession();
			await this.voteRepository.endSession();
		}
	}

	async deleteVoteFromCardGroup(
		boardId: string,
		cardId: string,
		userId: string,
		count: number,
		retryCount?: number
	) {
		await this.canUserDeleteVote(boardId, userId, count, cardId);

		let currentCount = Math.abs(count);

		const card = await this.getCardFromBoard(boardId, cardId);

		const mappedVotes = card.votes as string[];

		const userVotes = mappedVotes.filter((vote) => vote.toString() === userId.toString());

		await this.updateBoardUserService.startTransaction();
		await this.voteRepository.startTransaction();

		try {
			const withSession = true;

			if (!isEmpty(userVotes)) {
				currentCount = await this.deleteCardGroupAndUserVotes(
					mappedVotes,
					userVotes,
					boardId,
					cardId,
					userId,
					count,
					currentCount,
					withSession,
					retryCount
				);
			}

			if (!isEmpty(currentCount)) {
				await this.deleteCardItemAndUserVotes(
					currentCount,
					boardId,
					card,
					userId,
					withSession,
					retryCount
				);
			}
			await this.updateBoardUserService.commitTransaction();
			await this.voteRepository.commitTransaction();
		} catch (e) {
			this.logger.error(e);
			throw new DeleteFailedException(DELETE_VOTE_FAILED);
		} finally {
			await this.updateBoardUserService.endSession();
			await this.voteRepository.endSession();
		}
	}

	/* #################### HELPERS #################### */

	private async canUserDeleteVote(
		boardId: string,
		userId: string,
		count: number,
		cardId: string,
		cardItemId?: string
	) {
		const canUserDeleteVote = this.verifyIfUserCanDeleteVote(
			boardId,
			userId,
			count,
			cardId,
			cardItemId
		);

		if (!canUserDeleteVote) throw new DeleteFailedException(DELETE_VOTE_FAILED);
	}

	private async verifyIfUserCanDeleteVote(
		boardId: string,
		userId: string,
		count: number,
		cardId: string,
		cardItemId?: string
	): Promise<boolean> {
		const board = await this.getBoardService.getBoardById(boardId);

		if (!board) {
			return false;
		}

		const boardUser = await this.getBoardUserService.getBoardUser(boardId, userId);

		if (!boardUser) {
			return false;
		}

		const card = await this.getCardService.getCardFromBoard(boardId, cardId);

		if (!card) return false;

		const ifVotesIncludesUser = this.ifVotesIncludesUserId(card, String(userId), cardItemId);

		if (!ifVotesIncludesUser) {
			return false;
		}

		return boardUser.votesCount
			? boardUser.votesCount > 0 && boardUser.votesCount - Math.abs(count) >= 0
			: false;
	}

	private ifVotesIncludesUserId(card: Card, userId: string, cardItemId?: string) {
		if (cardItemId) {
			const item = card.items.find((item) => String(item._id) === String(cardItemId));

			return this.votesArrayVerification(item.votes as string[], userId);
		} else {
			let votes = card.votes as string[];
			card.items.forEach((item) => {
				votes = votes.concat(item.votes as string[]);
			});

			return this.votesArrayVerification(votes, userId);
		}
	}

	private async removeVotesFromCardItemAndUserOperations(
		boardId: string,
		cardItemId: string,
		votes: string[],
		cardId: string,
		count: number,
		userId: string,
		retryCount?: number
	) {
		let retryCountOperation = retryCount ?? 0;
		const withSession = true;

		try {
			await this.removeVotesFromCardItem(boardId, cardItemId, votes, cardId, withSession);
			await this.decrementVoteUser(boardId, userId, count, withSession);
		} catch (e) {
			this.logger.error(e);

			await this.updateBoardUserService.abortTransaction();
			await this.voteRepository.abortTransaction();

			if (e.code === WRITE_LOCK_ERROR && retryCountOperation < 5) {
				retryCountOperation++;
				await this.updateBoardUserService.endSession();
				await this.voteRepository.endSession();
				await this.deleteVoteFromCard(
					boardId,
					cardId,
					userId,
					cardItemId,
					count,
					retryCountOperation
				);
			} else {
				throw new DeleteFailedException(DELETE_VOTE_FAILED);
			}
		}
	}

	private async removeVotesFromCardGroup(
		boardId: string,
		mappedVotes: string[],
		cardId: string,
		withSession?: boolean
	) {
		const updatedBoard = await this.voteRepository.removeVotesFromCard(
			boardId,
			mappedVotes,
			cardId,
			withSession
		);

		if (!updatedBoard) throw new DeleteFailedException(DELETE_VOTE_FAILED);
	}

	private async removeVotesFromCardItem(
		boardId: string,
		cardItemId: string,
		votes: string[],
		cardId: string,
		withSession?: boolean
	) {
		const updatedBoard = await this.voteRepository.removeVotesFromCardItem(
			boardId,
			cardId,
			cardItemId,
			votes,
			withSession
		);

		if (!updatedBoard) throw new DeleteFailedException(DELETE_VOTE_FAILED);
	}

	private async deleteCardItemAndUserVotes(
		currentCount: number,
		boardId: string,
		card: Card,
		userId: string,
		withSession: boolean,
		retryCount?: number
	) {
		let items = card.items;
		while (currentCount > 0) {
			const item = items.find(({ votes: itemVotes }) =>
				arrayIdToString(itemVotes as string[]).includes(userId.toString())
			);

			if (!item) {
				throw new DeleteFailedException(DELETE_VOTE_FAILED);
			}

			const votesOfUser = (item.votes as string[]).filter(
				(vote) => vote.toString() === userId.toString()
			);

			const itemVotesToReduce =
				votesOfUser.length / currentCount >= 1 ? currentCount : votesOfUser.length;

			await this.deleteVoteFromCardItemOnCardGroup(
				boardId,
				card._id,
				userId,
				String(item._id),
				-itemVotesToReduce,
				withSession,
				retryCount
			);

			currentCount -= itemVotesToReduce;
			items = items.filter((card) => String(card._id) !== String(item._id));
		}
	}

	private async deleteCardGroupAndUserVotes(
		votes: string[],
		userVotes: string[],
		boardId: string,
		cardId: string,
		userId: string,
		count: number,
		currentCount: number,
		withSession: boolean,
		retryCount?: number
	) {
		let mappedVotes = votes.filter((vote) => vote.toString() !== userId.toString());

		const votesToReduce = userVotes.length / currentCount >= 1 ? currentCount : userVotes.length;

		userVotes.splice(0, Math.abs(votesToReduce));

		mappedVotes = mappedVotes.concat(userVotes);

		let retryCountOperation = retryCount ?? 0;

		try {
			await this.removeVotesFromCardGroup(boardId, mappedVotes, cardId, withSession);
			await this.decrementVoteUser(boardId, userId, -votesToReduce, withSession);

			currentCount -= Math.abs(votesToReduce);

			if (currentCount === 0) return;

			return currentCount;
		} catch (e) {
			this.logger.error(e);
			await this.updateBoardUserService.abortTransaction();
			await this.voteRepository.abortTransaction();

			if (e.code === WRITE_LOCK_ERROR && retryCountOperation < 5) {
				retryCountOperation++;
				await this.updateBoardUserService.endSession();
				await this.voteRepository.endSession();
				await this.deleteVoteFromCardGroup(boardId, cardId, userId, count, retryCountOperation);
			} else {
				throw new DeleteFailedException(DELETE_VOTE_FAILED);
			}
		}
	}

	private async deleteVoteFromCardItemOnCardGroup(
		boardId: string,
		cardId: string,
		userId: string,
		cardItemId: string,
		count: number,
		withSession: boolean,
		retryCount?: number
	) {
		const cardItem = await this.getCardItemFromBoard(boardId, cardId, cardItemId);

		const votes = this.getVotesFromCardItem(cardItem.votes as string[], String(userId), count);

		let retryCountOperation = retryCount ?? 0;

		try {
			await this.removeVotesFromCardItem(boardId, cardItemId, votes, cardId, withSession);
			await this.decrementVoteUser(boardId, userId, count, withSession);
		} catch (e) {
			this.logger.error(e);

			await this.updateBoardUserService.abortTransaction();
			await this.voteRepository.abortTransaction();

			if (e.code === WRITE_LOCK_ERROR && retryCountOperation < 5) {
				retryCountOperation++;
				await this.updateBoardUserService.endSession();
				await this.voteRepository.endSession();

				await this.deleteVoteFromCardGroup(boardId, cardId, userId, count, retryCountOperation);
			} else {
				throw new DeleteFailedException(DELETE_VOTE_FAILED);
			}
		}
	}

	private votesArrayVerification(votes: string[], userId: string) {
		return arrayIdToString(votes).includes(userId);
	}

	private async getCardFromBoard(boardId: string, cardId: string) {
		const card = await this.getCardService.getCardFromBoard(boardId, cardId);

		if (!card) throw new DeleteFailedException(DELETE_VOTE_FAILED);

		return card;
	}

	private async getCardItemFromBoard(boardId: string, cardId: string, cardItemId?: string) {
		const card = await this.getCardFromBoard(boardId, cardId);

		const cardItem = card.items.find((item) => item._id.toString() === cardItemId);

		if (!cardItem) throw new DeleteFailedException(DELETE_VOTE_FAILED);

		return cardItem;
	}

	private getVotesFromCardItem(votes: string[], userId: string, count: number) {
		let votesOnCardItem = [...votes];
		const userVotes = votesOnCardItem.filter((vote) => vote.toString() === userId);
		votesOnCardItem = votesOnCardItem.filter((vote) => vote.toString() !== userId);
		userVotes.splice(0, Math.abs(count));

		return votesOnCardItem.concat(userVotes);
	}
}
