import { useState } from "react";
import { getSession, GetSessionParams } from "next-auth/react";
import CreateBoard from "../components/Dashboard/CreateBoardModal";
import { styled } from "../stitches.config";
import Flex from "../components/Primitives/Flex";
import BoardsList from "../components/Dashboard/BoardList/BoardsList";
import Text from "../components/Primitives/Text";
import { ERROR_LOADING_DATA } from "../utils/constants";
import { RedirectServerSideProps, SessionServerSideProps } from "../types/serverSideProps";
import useBoard from "../hooks/useBoard";
import { AUTH_ROUTE } from "../utils/routes";

export async function getServerSideProps(
  context: GetSessionParams | undefined
): Promise<SessionServerSideProps | RedirectServerSideProps> {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: AUTH_ROUTE,
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

const Container = styled("div", Flex);

const Dashboard: React.FC = () => {
  const { fetchBoards } = useBoard({ autoFetchBoard: false, autoFetchBoards: true });
  const { data } = fetchBoards;

  const [isLoading, setIsLoading] = useState(false);

  const handleLoading = (state: boolean) => {
    setIsLoading(state);
  };

  const BoardsListContent = data ? <BoardsList boards={data} /> : <div>{ERROR_LOADING_DATA}</div>;

  if (isLoading) return <div>Loading....</div>;
  return (
    <Container direction="column" gap="40">
      <CreateBoard setFetchLoading={handleLoading} />
      <Text size="36" fontWeight="bold">
        All boards
      </Text>
      {BoardsListContent}
    </Container>
  );
};
export default Dashboard;
