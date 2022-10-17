import React, { useMemo, useRef } from 'react';
import { InfiniteData, UseInfiniteQueryResult } from 'react-query';

import { DotsLoading } from 'components/loadings/DotsLoading';
import Flex from 'components/Primitives/Flex';
import BoardType from 'types/board/board';
import { LastUpdatedText } from './styles';
import { Team } from 'types/team/team';
import CardBody from '../CardTeam/CardBody';

type ListOfCardsProp = {
	teams: Team[];
	userId: string;
	isLoading: boolean;
};

const ListOfCards = React.memo<ListOfCardsProp>(({ teams, userId, isLoading }) => {
	return (
		<Flex
			css={{ mt: '$24', height: 'calc(100vh - 450px)', overflow: 'auto', pr: '$10' }}
			direction="column"
			gap="24"
			justify="start"
		>
			<Flex direction="column" gap="20">
				{teams.map((team: Team) => (
					<CardBody key={team._id} team={team} userId={userId} />
				))}
			</Flex>

			{isLoading && (
				<Flex justify="center">
					<DotsLoading />
				</Flex>
			)}
		</Flex>
	);
});

export default ListOfCards;
