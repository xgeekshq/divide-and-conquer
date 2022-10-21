import Link from 'next/link';

import { EmptyBoardsText, StyledBox, StyledImage, StyledNewTeamLink } from './styles';

const EmptyTeams: React.FC = () => {
	return (
		<StyledBox align="center" direction="column" elevation="1" justify="center">
			<StyledImage />
			<EmptyBoardsText css={{ mt: '$24', textAlign: 'center' }} size="md">
				<br />
				<Link href="/boards/new">
					<StyledNewTeamLink underline weight="medium">
						Create your first team
					</StyledNewTeamLink>
				</Link>{' '}
				now.
			</EmptyBoardsText>
		</StyledBox>
	);
};
export default EmptyTeams;
