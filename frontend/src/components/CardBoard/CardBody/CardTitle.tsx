import Link from 'next/link';

import { styled } from 'styles/stitches/stitches.config';

import Text from 'components/Primitives/Text';
import Tooltip from 'components/Primitives/Tooltip';

type CardTitleProps = {
	userIsParticipating: boolean;
	boardId: string;
	title: string;
	isSubBoard: boolean | undefined;
	mainBoardId?: string;
};

const StyledBoardTitle = styled(Text, {
	fontWeight: '$bold',
	fontSize: '$14',
	letterSpacing: '$0-17',
	'&[data-disabled="true"]': { opacity: 0.4 },
	'@hover': {
		'&:hover': {
			'&[data-disabled="true"]': {
				textDecoration: 'none',
				cursor: 'default'
			},
			textDecoration: 'underline',
			cursor: 'pointer'
		}
	}
});

const CardTitle: React.FC<CardTitleProps> = ({
	userIsParticipating,
	boardId,
	title,
	isSubBoard,
	mainBoardId
}) => {
	const getTitle = () => {
		if (userIsParticipating) {
			return (
				<Link
					key={boardId}
					href={{
						pathname: `boards/[boardId]`,
						query: isSubBoard ? { boardId, mainBoardId } : { boardId }
					}}
				>
					<StyledBoardTitle data-disabled={!userIsParticipating}>
						{title}
					</StyledBoardTitle>
				</Link>
			);
		}

		return <StyledBoardTitle data-disabled={!userIsParticipating}>{title}</StyledBoardTitle>;
	};

	if (isSubBoard) {
		return (
			<Tooltip content="It’s a sub-team board. A huge team got splitted into sub teams.">
				{getTitle()}
			</Tooltip>
		);
	}
	return getTitle();
};

CardTitle.defaultProps = {
	mainBoardId: undefined
};

export default CardTitle;
