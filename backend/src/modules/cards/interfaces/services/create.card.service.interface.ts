import CardDto from '../../dto/card.dto';
import Card from '../../entities/card.schema';

export interface CreateCardServiceInterface {
	create(
		boardId: string,
		userId: string,
		card: CardDto,
		colIdToAdd: string
	): Promise<{
		newCard: Card;
		hideCards: boolean;
		hideVotes: boolean;
	}>;
}
