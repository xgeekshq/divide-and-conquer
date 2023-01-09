import { useMutation } from 'react-query';
import { useSession } from 'next-auth/react';
import { useSetRecoilState } from 'recoil';

import {
  handleDeleteCard,
  handleMergeCard,
  handleNewCard,
  handleUnMergeCard,
  handleUpdateCardPosition,
  handleUpdateText,
} from '@/helper/board/transformBoard';
import { mergeCardState } from '@/store/mergeCard/atoms/merge-card.atom';
import BoardType from '@/types/board/board';
import AddCardDto from '@/types/card/addCard.dto';
import CardType from '@/types/card/card';
import ColumnType from '@/types/column';
import { ToastStateEnum } from '@/utils/enums/toast-types';
import UpdateCardPositionDto from '@/types/card/updateCardPosition.dto';
import {
  addCardRequest,
  deleteCardRequest,
  mergeBoardRequest,
  mergeCardsRequest,
  removeFromMergeRequest,
  updateCardPositionRequest,
  updateCardRequest,
} from '../api/boardService';
import useBoardUtils from './useBoardUtils';

const useCards = () => {
  const { queryClient, setToastState } = useBoardUtils();
  const { data: session } = useSession({ required: false });

  const user = session?.user;

  const setMergeCard = useSetRecoilState(mergeCardState);

  const getBoardQuery = (id: string | undefined) => ['board', { id }];

  const setPreviousBoardQuery = (id: string, context: any) => {
    queryClient.setQueryData(
      getBoardQuery(id),
      (context as { previousBoard: BoardType }).previousBoard,
    );
  };

  const getPrevData = async (id: string | undefined): Promise<BoardType | undefined> => {
    const query = getBoardQuery(id);
    await queryClient.cancelQueries(query);
    const prevData = queryClient.getQueryData<{ board: BoardType }>(query);
    return prevData?.board;
  };

  const generateNewCard = (newCardData: AddCardDto): CardType => {
    const idCard = '123';
    const newCard: CardType = {
      _id: idCard,
      text: newCardData.card.text,
      votes: [],
      comments: [],
      anonymous: newCardData.card.anonymous,
      createdBy: {
        _id: user ? user.id : '',
        firstName: user ? user.firstName : '',
        lastName: user ? user.lastName : '',
        email: '',
        joinedAt: '',
        isSAdmin: false,
      },
      items: [
        {
          _id: idCard,
          text: newCardData.card.text,
          votes: [],
          comments: [],
          anonymous: newCardData.card.anonymous,
          createdBy: {
            _id: user ? user.id : '',
            firstName: user ? user.firstName : '',
            lastName: user ? user.lastName : '',
            email: '',
            joinedAt: '',
            isSAdmin: false,
          },
        },
      ],
    };
    return newCard;
  };

  const updateBoardColumns = (id: string, columns: ColumnType[]) => {
    queryClient.setQueryData<{ board: BoardType } | undefined>(
      getBoardQuery(id),
      (old: { board: BoardType } | undefined) => {
        if (old)
          return {
            board: {
              ...old.board,
              columns,
            },
          };

        return old;
      },
    );
  };

  const addCardInColumn = useMutation(addCardRequest, {
    onMutate: async (data) => {
      const prevBoardData = await getPrevData(data.boardId);

      if (prevBoardData && user) {
        const boardData = handleNewCard(prevBoardData, data.colIdToAdd, generateNewCard(data));
        updateBoardColumns(data.boardId, boardData.columns);
      }

      return { previousBoard: prevBoardData, data };
    },
    onSettled: (data, error, variables) => {
      if (!error) {
        queryClient.setQueryData(getBoardQuery(variables.boardId), { board: data });
      }
    },
    onError: (_, variables, context) => {
      setPreviousBoardQuery(variables.boardId, context);
      queryClient.invalidateQueries(getBoardQuery(variables.boardId));
      setToastState({
        open: true,
        content: 'Error adding the card',
        type: ToastStateEnum.ERROR,
      });
    },
  });

  const updateCardPositionOptimistic = async (data: UpdateCardPositionDto) => {
    const prevBoardData = await getPrevData(data.boardId);

    if (prevBoardData) {
      const newBoard = handleUpdateCardPosition(prevBoardData, data);
      updateBoardColumns(data.boardId, newBoard.columns);
    }

    return prevBoardData;
  };

  const updateCardPosition = useMutation(updateCardPositionRequest, {
    onMutate: async (data) => {
      const prevBoardData = updateCardPositionOptimistic(data);

      return { previousBoard: prevBoardData, data };
    },
    onSettled: () => {},
    onError: (data, variables) => {
      queryClient.invalidateQueries(getBoardQuery(variables.boardId));
      setToastState({
        open: true,
        content: 'Error updating the card position',
        type: ToastStateEnum.ERROR,
      });
    },
  });

  const updateCard = useMutation(updateCardRequest, {
    onMutate: async (data) => {
      const prevBoardData = await getPrevData(data.boardId);

      if (prevBoardData) {
        const boardData = handleUpdateText(prevBoardData, data);
        updateBoardColumns(data.boardId, boardData.columns);
      }

      return { previousBoard: prevBoardData, data };
    },
    onSettled: () => {},
    onError: (data, variables, context) => {
      setPreviousBoardQuery(variables.boardId, context);
      queryClient.invalidateQueries(getBoardQuery(variables.boardId));
      setToastState({
        open: true,
        content: 'Error updating the card',
        type: ToastStateEnum.ERROR,
      });
    },
  });

  const deleteCard = useMutation(deleteCardRequest, {
    onMutate: async (data) => {
      const prevBoardData = await getPrevData(data.boardId);

      if (prevBoardData) {
        const boardData = handleDeleteCard(prevBoardData, data);
        updateBoardColumns(data.boardId, boardData.columns);
      }

      return { previousBoard: prevBoardData, data };
    },
    onSettled: () => {
      setToastState({
        open: true,
        type: ToastStateEnum.SUCCESS,
        content: 'Card deleted with success!',
      });
    },
    onError: (_, variables, context) => {
      setPreviousBoardQuery(variables.boardId, context);
      queryClient.invalidateQueries(getBoardQuery(variables.boardId));
      setToastState({
        open: true,
        content: 'Error deleting the card',
        type: ToastStateEnum.ERROR,
      });
    },
  });

  const mergeBoard = useMutation(mergeBoardRequest, {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getBoardQuery(variables.subBoardId));
    },
    onError: () => {
      setToastState({
        open: true,
        content: 'Error mergint the board',
        type: ToastStateEnum.ERROR,
      });
    },
  });

  // #region MERGE_CARDS

  const mergeCards = useMutation(mergeCardsRequest, {
    onMutate: async (data) => {
      const prevBoardData = await getPrevData(data.boardId);

      if (prevBoardData) {
        const boardData = handleMergeCard(prevBoardData, data);
        updateBoardColumns(data.boardId, boardData.columns);
      }

      return { previousBoard: prevBoardData, data };
    },
    onSettled: (data, error, variables) => {
      if (!error) {
        queryClient.setQueryData(getBoardQuery(variables.boardId), { board: data });
      }
    },
    onError: (data, variables) => {
      queryClient.invalidateQueries(getBoardQuery(variables.boardId));
      setMergeCard(undefined);
      setToastState({
        open: true,
        content: 'Error merging the cards',
        type: ToastStateEnum.ERROR,
      });
    },
  });

  const removeFromMergeCard = useMutation(removeFromMergeRequest, {
    onMutate: async (data) => {
      const prevBoardData = await getPrevData(data.boardId);

      if (prevBoardData) {
        const boardData = handleUnMergeCard(prevBoardData, data);
        updateBoardColumns(data.boardId, boardData.columns);
      }

      return { previousBoard: prevBoardData, data };
    },
    onSettled: (data, error, variables) => {
      if (!error) {
        queryClient.setQueryData(getBoardQuery(variables.boardId), { board: data });
      }
    },
    onError: (data, variables) => {
      queryClient.invalidateQueries(getBoardQuery(variables.boardId));
      setToastState({
        open: true,
        content: 'Error unmerge the card',
        type: ToastStateEnum.ERROR,
      });
    },
  });

  // #endregion

  return {
    addCardInColumn,
    updateCardPosition,
    updateCard,
    deleteCard,
    mergeCards,
    removeFromMergeCard,
    mergeBoard,
    updateCardPositionOptimistic,
  };
};

export default useCards;
