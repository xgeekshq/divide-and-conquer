import React, { useEffect, useMemo, useRef, useState } from 'react';

import { styled } from 'styles/stitches/stitches.config';

import Icon from 'components/icons/Icon';
import Avatar from 'components/Primitives/Avatar';
import Button from 'components/Primitives/Button';
import Flex from 'components/Primitives/Flex';
import Text from 'components/Primitives/Text';
import { cardBlur } from 'helper/board/blurFilter';
import { getCardVotes } from 'helper/board/votes';
import useVotes from 'hooks/useVotes';
import { BoardUser } from 'types/board/board.user';
import CardType from 'types/card/card';
import { CardItemType } from 'types/card/cardItem';
import CommentType from 'types/comment/comment';

interface FooterProps {
	boardId: string;
	userId: string;
	socketId: string | undefined;
	card: CardType | CardItemType;
	anonymous: boolean;
	isItem: boolean;
	teamName?: string;
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
		color: '$primary500'
	},
	'@hover': {
		'&:hover': {
			backgroundColor: 'transparent !important'
		}
	},
	'&:active': {
		boxShadow: 'none !important'
	},
	'&:disabled': {
		svg: {
			opacity: '0.2'
		}
	}
});

const CardFooter = React.memo<FooterProps>(
	({
		boardId,
		userId,
		socketId,
		card,
		anonymous,
		teamName,
		isItem,
		isMainboard,
		comments,
		boardUser,
		maxVotes,
		setOpenComments,
		isCommentsOpened,
		hideCards
	}) => {
		const createdBy = useMemo(() => {
			if (Object.hasOwnProperty.call(card, 'items')) {
				const cardTyped = card as CardType;
				return cardTyped.items[cardTyped.items.length - 1].createdBy;
			}
			return card.createdBy;
		}, [card]);

		const { handleVote } = useVotes();

		const user = boardUser;
		const disableVotes = maxVotes && user && user.votesCount >= maxVotes;

		const calculateVotes = () => {
			if (Object.hasOwnProperty.call(card, 'items')) {
				const cardTyped = card as CardType;
				const cardItemId =
					cardTyped.items.length === 1 ? cardTyped.items[0]._id : undefined;

				const votesInThisCard =
					cardTyped.items.length === 1
						? cardTyped.items[0].votes
						: getCardVotes(cardTyped);

				const votesOfUserInThisCard = votesInThisCard.filter(
					(vote) => vote === userId
				).length;
				return { cardItemId, votesOfUserInThisCard, votesInThisCard };
			}
			return { cardItemId: undefined, votesOfUserInThisCard: 0, votesInThisCard: [] };
		};
		const votesData = calculateVotes();

		const { cardItemId, votesInThisCard } = votesData;

		const [countVotes, setCountVotes] = useState(0);

		const firstUpdate = useRef(true);
		useEffect(() => {
			if (firstUpdate.current) {
				firstUpdate.current = false;
				return;
			}

			const delayDebounceFn = setTimeout(() => {
				handleVote.mutate({
					boardId,
					cardId: card._id,
					socketId,
					cardItemId,
					isCardGroup: cardItemId === undefined,
					count: countVotes
				});
				setCountVotes(0);
				firstUpdate.current = true;
			}, 200);

			// eslint-disable-next-line consistent-return
			return () => clearTimeout(delayDebounceFn);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [countVotes, firstUpdate]);

		const handleDeleteVote = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			event.stopPropagation();
			if (hideCards && card.createdBy?._id !== userId) return;
			setCountVotes(countVotes - 1);
		};

		const handleAddVote = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			event.stopPropagation();
			if (hideCards && card.createdBy?._id !== userId) return;
			if (maxVotes && user && user.votesCount >= maxVotes) return;
			setCountVotes(countVotes + 1);
		};

		return (
			<Flex align="center" gap="6" justify={!anonymous ? 'between' : 'end'}>
				{!anonymous && !teamName && (
					<Flex
						align="center"
						gap="4"
						css={{
							filter: cardBlur(hideCards, card as CardType, userId)
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
				{teamName && (
					<Text size="xs" weight="medium">
						{teamName}
					</Text>
				)}
				{!isItem && comments && (
					<Flex align="center" gap="10">
						<Flex
							align="center"
							gap="2"
							css={{
								filter: cardBlur(hideCards, card as CardType, userId)
							}}
						>
							<StyledButtonIcon
								disabled={!isMainboard || !!disableVotes}
								onClick={handleAddVote}
							>
								<Icon name="thumbs-up" />
							</StyledButtonIcon>
							<Text
								size="xs"
								css={{
									visibility: votesInThisCard.length > 0 ? 'visible' : 'hidden',
									width: '10px'
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
								filter: cardBlur(hideCards, card as CardType, userId)
							}}
						>
							<StyledButtonIcon
								disabled={!isMainboard || votesInThisCard.length === 0}
								onClick={handleDeleteVote}
							>
								<Icon name="thumbs-down" />
							</StyledButtonIcon>
						</Flex>

						<Flex
							align="center"
							gap="2"
							css={{
								filter: cardBlur(hideCards, card as CardType, userId)
							}}
						>
							<StyledButtonIcon onClick={setOpenComments}>
								<Icon name={isCommentsOpened ? 'comment-filled' : 'comment'} />
							</StyledButtonIcon>
							<Text
								css={{ visibility: comments.length > 0 ? 'visible' : 'hidden' }}
								size="xs"
							>
								{comments.length}
							</Text>
						</Flex>
					</Flex>
				)}
			</Flex>
		);
	}
);

export default CardFooter;
