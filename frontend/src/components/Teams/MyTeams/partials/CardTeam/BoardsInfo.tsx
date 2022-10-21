import { useQuery } from 'react-query';
import Link from 'next/link';

import { getDashboardHeaderInfo } from 'api/authService';
import Icon from 'components/icons/Icon';
import Flex from 'components/Primitives/Flex';
import Text from 'components/Primitives/Text';

type BoardsInfoProps = {
	userSAdmin: boolean | undefined;
	teamAdmin: boolean;
};

const BoardsInfo = ({ userSAdmin, teamAdmin }: BoardsInfoProps) => {
	const { data: boardInfo } = useQuery('dashboardInfo', () => getDashboardHeaderInfo(), {
		enabled: true,
		refetchOnWindowFocus: false
	});

	if (!boardInfo?.boardsCount) {
		return (
			<Flex css={{ ml: '$40', display: 'flex', alignItems: 'center' }}>
				{(userSAdmin || teamAdmin) && (
					<Link href="/boards/new">
						<a style={{ textDecoration: 'none' }}>
							<Flex css={{ alignItems: 'center' }}>
								<Icon
									name="plus"
									css={{
										width: '16px',
										height: '$32',
										marginRight: '$10'
									}}
								/>
								<Text css={{ ml: '$14' }} size="sm" weight="medium">
									{' '}
									Create first team board
								</Text>
							</Flex>
						</a>
					</Link>
				)}
				{!teamAdmin && (
					<Text css={{ ml: '$14' }} size="sm" weight="medium">
						0 boards
					</Text>
				)}
			</Flex>
		);
	}

	return (
		<Flex css={{ ml: '$40', display: 'flex', alignItems: 'center' }}>
			<Link href="boards/">
				<Text css={{ ml: '$14' }} size="sm" weight="medium">
					{boardInfo.boardsCount} team boards
				</Text>
			</Link>
		</Flex>
	);
};

export default BoardsInfo;
