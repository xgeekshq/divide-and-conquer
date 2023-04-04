import {
  EmptyBoardsText,
  StyledBox,
  StyledImage,
  StyledNewBoardLink,
} from '@/components/Dashboard/RecentRetros/partials/EmptyBoards/styles';
import Link from 'next/link';

interface EmptyTeamBoardsProps {
  teamId: string;
}

const EmptyTeamBoards = ({ teamId }: EmptyTeamBoardsProps) => (
  <StyledBox align="center" direction="column" elevation="1" justify="center">
    <StyledImage />
    <EmptyBoardsText css={{ mt: '$24', textAlign: 'center' }} size="md">
      This team has no retros yet.
      <br />
      <Link
        href={{
          pathname: `/boards/new`,
          query: { team: teamId },
        }}
        passHref
        legacyBehavior
      >
        <StyledNewBoardLink underline fontWeight="medium">
          Add a new team board
        </StyledNewBoardLink>
      </Link>{' '}
      now.
    </EmptyBoardsText>
  </StyledBox>
);
export default EmptyTeamBoards;
