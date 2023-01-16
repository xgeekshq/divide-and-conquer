import React, { useEffect, useMemo, useState } from 'react';

import { styled } from '@/styles/stitches/stitches.config';

import Icon from '@/components/icons/Icon';
import Avatar from '@/components/Primitives/Avatar';
import Button from '@/components/Primitives/Button';
import Flex from '@/components/Primitives/Flex';
import Text from '@/components/Primitives/Text';
import { cardFooterBlur } from '@/helper/board/blurFilter';
import { getCardVotes } from '@/helper/board/votes';
import useVotes from '@/hooks/useVotes';
import { BoardUser } from '@/types/board/board.user';
import CardType from '@/types/card/card';
import { CardItemType } from '@/types/card/cardItem';
import CommentType from '@/types/comment/comment';

interface FooterProps {
  boardId: string;
  userId: string;
  socketId: string | undefined;
  card: CardType | CardItemType;
  anonymous: boolean;
  isItem: boolean;
  isMainboard: boolean;
  setOpenComments?: () => void;
  comments?: CommentType[];
  isCommentsOpened?: boolean;
  boardUser?: BoardUser;
  maxVotes?: number;
  hideCards: boolean;
}

const StyledButtonIcon = styled(Button, {
  m: '0 !important',
  p: '0 !important',
  lineHeight: '0 !important',
  height: 'fit-content !important',
  backgroundColor: 'transparent !important',
  '& svg': {
    color: '$primary500',
  },
  '@hover': {
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  },
  '&:active': {
    boxShadow: 'none !important',
  },
  '&:disabled': {
    svg: {
      opacity: '0.2',
    },
  },
});

const CardFooter = ({
  boardId,
  userId,
  socketId,
  card,
  anonymous,
  isItem,
  isMainboard,
  comments,
  boardUser,
  maxVotes,
  setOpenComments,
  isCommentsOpened,
  hideCards,
}: FooterProps) => {
  const createdBy = useMemo(() => {
    if (Object.hasOwnProperty.call(card, 'items')) {
      const cardTyped = card as CardType;
      return cardTyped.items.at(-1)?.createdBy;
    }
    return card.createdBy;
  }, [card]);

  const createdByTeam = useMemo(() => {
    if (Object.hasOwnProperty.call(card, 'items')) {
      const cardTyped = card as CardType;
      return cardTyped.items.at(-1)?.createdByTeam;
    }
    return card.createdByTeam;
  }, [card]);

  const {
    handleVote: { mutate, status },
    toastInfoMessage,
    updateVote,
  } = useVotes();

  const user = boardUser;
  const userVotes = user?.votesCount ?? 0;

  const [count, setCount] = useState(0);

  const calculateVotes = () => {
    const cardTyped = card as CardType;
    if (Object.hasOwnProperty.call(card, 'items')) {
      const cardItemId = cardTyped.items.length === 1 ? cardTyped.items[0]._id : undefined;

      const votesInThisCard =
        cardTyped.items.length === 1 ? cardTyped.items[0].votes : getCardVotes(cardTyped);

      const votesOfUserInThisCard = votesInThisCard.filter((vote) => vote === userId).length;

      return { cardItemId, votesOfUserInThisCard, votesInThisCard };
    }

    return { cardItemId: undefined, votesOfUserInThisCard: 0, votesInThisCard: [] };
  };

  const { cardItemId, votesInThisCard, votesOfUserInThisCard } = calculateVotes();

  const handleDeleteVote = () => {
    if ((hideCards && createdBy?._id !== userId) || status === 'loading') return;
    if (maxVotes) {
      toastInfoMessage(`You have ${maxVotes! - (userVotes - 1)} votes left.`);
    }
    updateVote({
      boardId,
      cardId: card._id,
      socketId,
      cardItemId,
      isCardGroup: cardItemId === undefined,
      count: count - 1,
      userId,
      fromRequest: true,
    });
    setCount((prev) => prev - 1);
  };

  const handleAddVote = () => {
    if (status === 'loading') return;
    if (maxVotes) {
      toastInfoMessage(`You have ${maxVotes - (userVotes + 1)} votes left.`);
    }
    updateVote({
      boardId,
      cardId: card._id,
      socketId,
      cardItemId,
      isCardGroup: cardItemId === undefined,
      count: count + 1,
      userId,
      fromRequest: true,
    });
    setCount((prev) => prev + 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count === 0) return;
      mutate({
        boardId,
        cardId: card._id,
        socketId,
        cardItemId,
        isCardGroup: cardItemId === undefined,
        count,
        userId,
        fromRequest: true,
      });
      setCount(0);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <Flex align="center" gap="6" justify={!anonymous || createdByTeam ? 'between' : 'end'}>
      {!anonymous && !createdByTeam && (
        <Flex
          align="center"
          gap="4"
          css={{
            filter: cardFooterBlur(hideCards, createdBy, userId),
          }}
        >
          <Avatar
            isBoardPage
            fallbackText={`${createdBy?.firstName[0]}${createdBy?.lastName[0]}`}
            id={createdBy?._id}
            isDefaultColor={createdBy?._id === userId}
            size={20}
          />
          <Text size="xs">
            {createdBy?.firstName} {createdBy?.lastName}
          </Text>
        </Flex>
      )}
      {createdByTeam && (
        <Text size="xs" weight="medium">
          {createdByTeam}
        </Text>
      )}
      {!isItem && comments && (
        <Flex align="center" gap="10">
          <Flex
            align="center"
            gap="2"
            css={{
              filter: cardFooterBlur(hideCards, createdBy, userId),
            }}
          >
            <StyledButtonIcon
              disabled={
                !isMainboard ||
                (maxVotes && user?.votesCount === maxVotes) ||
                (hideCards && createdBy?._id !== userId)
              }
              onClick={handleAddVote}
            >
              <Icon name="thumbs-up" />
            </StyledButtonIcon>
            <Text
              size="xs"
              css={{
                visibility: votesInThisCard.length > 0 ? 'visible' : 'hidden',
                width: '10px',
              }}
            >
              {votesInThisCard.length}
            </Text>
          </Flex>

          <Flex
            align="center"
            gap="2"
            css={{
              mr: '$10',
              filter: cardFooterBlur(hideCards, createdBy, userId),
            }}
          >
            <StyledButtonIcon
              disabled={
                !isMainboard ||
                votesInThisCard.length === 0 ||
                (maxVotes && userVotes === 0) ||
                votesOfUserInThisCard === 0 ||
                (hideCards && createdBy?._id !== userId)
              }
              onClick={handleDeleteVote}
            >
              <Icon name="thumbs-down" />
            </StyledButtonIcon>
          </Flex>

          <Flex
            align="center"
            gap="2"
            css={{
              filter: cardFooterBlur(hideCards, createdBy, userId),
            }}
          >
            <StyledButtonIcon
              disabled={hideCards && createdBy?._id !== userId}
              onClick={setOpenComments}
            >
              <Icon name={isCommentsOpened ? 'comment-filled' : 'comment'} />
            </StyledButtonIcon>
            <Text css={{ visibility: comments.length > 0 ? 'visible' : 'hidden' }} size="xs">
              {comments.length}
            </Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default CardFooter;
