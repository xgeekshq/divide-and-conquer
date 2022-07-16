import BoardType from 'types/board/board';
import MergeCardsDto from 'types/board/mergeCard.dto';
import CardType from 'types/card/card';
import DeleteCardDto from 'types/card/deleteCard.dto';
import RemoveFromCardGroupDto from 'types/card/removeFromCardGroup.dto';
import UpdateCardDto from 'types/card/updateCard.dto';
import UpdateCardPositionDto from 'types/card/updateCardPosition.dto';
import { addElementAtIndex, removeElementAtIndex } from 'utils/array';

// avoid read only error
const removeReadOnly = (board: BoardType): BoardType => JSON.parse(JSON.stringify(board));

export const handleNewCard = (board: BoardType, colIdToAdd: string, newCard: CardType) => {
	const boardData = removeReadOnly(board);

	const column = boardData.columns.find((col) => col._id === colIdToAdd);
	if (column) {
		column.cards = addElementAtIndex(column.cards, 0, newCard);
	}

	return boardData;
};

export const handleDeleteCard = (board: BoardType, data: DeleteCardDto): BoardType => {
	const boardData = removeReadOnly(board);

	boardData.columns.forEach((column) => {
		column.cards.forEach((card, index) => {
			if (card._id === data.cardId) {
				column.cards.splice(index, 1);
			}
		});
	});

	return boardData;
};

export const handleUpdateText = (board: BoardType, data: UpdateCardDto) => {
	const boardData = removeReadOnly(board);

	boardData.columns.forEach((col) => {
		col.cards.forEach((card) => {
			if (card._id === data.cardId) {
				card.text = data.text;
			}
		});
	});
	return boardData;
};

export const handleUpdateCardPosition = (board: BoardType, changes: UpdateCardPositionDto) => {
	const boardData = removeReadOnly(board);

	const { targetColumnId, colIdOfCard, newPosition, cardPosition } = changes;
	const colToRemove = boardData.columns.find((col) => col._id === colIdOfCard);
	const colToAdd = boardData.columns.find((col) => col._id === targetColumnId);
	const cardToAdd = colToRemove?.cards[cardPosition];

	if (cardToAdd && colToAdd && colToRemove) {
		colToRemove.cards = removeElementAtIndex(colToRemove.cards, cardPosition);
		colToAdd.cards = addElementAtIndex(colToAdd.cards, newPosition, cardToAdd);
	}
	return boardData;
};

export const handleMergeCard = (board: BoardType, changes: MergeCardsDto) => {
	const boardData = removeReadOnly(board);

	const { cardGroupId, cardId, colIdOfCardGroup } = changes;
	const column = boardData.columns.find((col) => col._id === colIdOfCardGroup);
	const cardGroup = column?.cards.find((card) => card._id === cardGroupId);
	const selectedCard = column?.cards.find((card) => card._id === cardId);

	if (column && cardGroup && selectedCard) {
		cardGroup.items = addElementAtIndex(cardGroup.items, cardGroup.items.length, {
			_id: selectedCard._id,
			text: selectedCard.text,
			comments: selectedCard.comments,
			votes: selectedCard.votes,
			createdBy: selectedCard.createdBy,
			createdByTeam: selectedCard.createdByTeam
		});

		const index = column.cards.findIndex((idxCard) => idxCard === selectedCard);
		column.cards = removeElementAtIndex(column.cards, index);
	}

	return boardData;
};

export const handleUnMergeCard = (board: BoardType, changes: RemoveFromCardGroupDto) => {
	const boardData = removeReadOnly(board);

	const { columnId, cardGroupId, cardId } = changes;
	const column = boardData.columns.find((col) => col._id === columnId);
	const cardGroup = column?.cards.find((card) => card._id === cardGroupId);
	const selectedCard = cardGroup?.items.find((item) => item._id === cardId);

	if (column && cardGroup && selectedCard) {
		column.cards = addElementAtIndex(column.cards, column.cards.length, {
			...selectedCard,
			items: [selectedCard]
		});
	}

	return boardData;
};
