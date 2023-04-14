import Link from 'next/link';

import {
  EmptyBoardsText,
  StyledBox,
  StyledImage,
  StyledNewBoardLink,
} from '@/components/Dashboard/RecentRetros/partials/EmptyBoards/styles';

const EmptyPersonalBoards = () => (
  <StyledBox align="center" direction="column" elevation="1" justify="center">
    <StyledImage />
    <EmptyBoardsText css={{ mt: '$24', textAlign: 'center' }} size="md">
      You have no personal boards yet.
      <br />
      <Link
        legacyBehavior
        passHref
        href={{
          pathname: `/boards/new`,
        }}
      >
        <StyledNewBoardLink underline fontWeight="medium">
          Add a new personal board
        </StyledNewBoardLink>
      </Link>{' '}
      now.
    </EmptyBoardsText>
  </StyledBox>
);
export default EmptyPersonalBoards;
