import React, { useState } from 'react';

import Icon from 'components/icons/Icon';
import Flex from 'components/Primitives/Flex';
import Separator from 'components/Primitives/Separator';
import Text from 'components/Primitives/Text';
import { CardItemType } from 'types/card/cardItem';
import CommentType from 'types/comment/comment';
import AddCardOrComment from '../AddCardOrComment';
import Comment from './Comment';

interface CommentsListProps {
	comments: CommentType[];
	cardId: string;
	cardItems: CardItemType[];
	boardId: string;
	socketId: string;
	isSubmited: boolean;
}

const Comments = React.memo(
	({ comments, cardId, cardItems, boardId, socketId, isSubmited }: CommentsListProps) => {
		const [isCreateCommentOpened, setCreateComment] = useState(false);

		const handleSetCreateComment = () => {
			if (!isSubmited) setCreateComment(!isCreateCommentOpened);
		};

		return (
			<Flex css={{ width: '100%', pb: '$16' }} direction="column" align="center">
				<Flex gap="4" align="center" css={{ width: '100%', mb: '$12' }}>
					<Separator
						orientation="horizontal"
						css={{ backgroundColor: 'black', width: '$8 !important' }}
					/>
					<Text size="xxs">Comments</Text>
					<Separator
						orientation="horizontal"
						css={{ backgroundColor: 'black', width: '100% !important' }}
					/>
				</Flex>
				<Flex direction="column" gap="8" css={{ px: '$16', mb: '$12', width: '100%' }}>
					{comments.map((comment) => (
						<Comment
							key={comment._id}
							comment={comment}
							cardId={cardId}
							cardItemId={
								cardItems.find((item) => {
									if (item && item.comments)
										return item.comments.find(
											(commentFound) => commentFound._id === comment._id
										);
									return null;
								})?._id
							}
							boardId={boardId}
							socketId={socketId}
							isSubmited={isSubmited}
						/>
					))}
				</Flex>
				{isCreateCommentOpened && !isSubmited && (
					<Flex css={{ width: '100%', px: '$16' }}>
						<AddCardOrComment
							isCard={false}
							isUpdate={false}
							colId="1"
							boardId={boardId}
							socketId={socketId}
							cardId={cardId}
							cardItemId={cardItems.length === 1 ? cardItems[0]._id : undefined}
							cancelUpdate={handleSetCreateComment}
						/>
					</Flex>
				)}
				{!isCreateCommentOpened && !isSubmited && (
					<Flex
						css={{ '@hover': { '&:hover': { cursor: 'pointer' } } }}
						onClick={handleSetCreateComment}
					>
						<Icon
							name="plus"
							css={{ color: '$primary400', width: '$16', height: '$16' }}
						/>
					</Flex>
				)}
			</Flex>
		);
	}
);

export default Comments;
