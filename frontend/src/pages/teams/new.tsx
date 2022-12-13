import { dehydrate, QueryClient, useQuery } from 'react-query';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useSetRecoilState } from 'recoil';
import { getAllUsers } from '@/api/userService';
import requireAuthentication from '@/components/HOC/requireAuthentication';
import CreateTeam from '@/components/Teams/CreateTeam';
import { membersListState, usersListState } from '@/store/team/atom/team.atom';
import { toastState } from '@/store/toast/atom/toast.atom';
import { TeamUser } from '@/types/team/team.user';
import { TeamUserRoles } from '@/utils/enums/team.user.roles';
import { ToastStateEnum } from '@/utils/enums/toast-types';
import QueryError from '@/components/Errors/QueryError';
import LoadingPage from '@/components/loadings/LoadingPage';
import { Suspense, useEffect } from 'react';
import { verifyIfIsNewJoiner } from '@/utils/verifyIfIsNewJoiner';

const NewTeam: NextPage = () => {
  const { data: session } = useSession({ required: true });
  const setToastState = useSetRecoilState(toastState);

  const { data } = useQuery(['users'], () => getAllUsers(), {
    enabled: true,
    refetchOnWindowFocus: false,
    onError: () => {
      setToastState({
        open: true,
        content: 'Error getting the users',
        type: ToastStateEnum.ERROR,
      });
    },
  });

  const setUsersListState = useSetRecoilState(usersListState);
  const setMembersListState = useSetRecoilState(membersListState);

  useEffect(() => {
    const listMembers: TeamUser[] | undefined = [];

    if (!data) {
      return;
    }
    data.forEach((user) => {
      if (user._id === session?.user.id) {
        listMembers.push({
          user,
          role: TeamUserRoles.ADMIN,
          isNewJoiner: verifyIfIsNewJoiner(user.joinedAt, user.providerAccountCreatedAt),
        });
      }
    });

    const usersWithChecked = data.map((user) => ({
      ...user,
      isChecked: user._id === session?.user.id,
    }));

    setUsersListState(usersWithChecked);

    setMembersListState(listMembers);
  }, [data, session?.user.id, setMembersListState, setUsersListState]);

  if (!session || !data) return null;

  return (
    <Suspense fallback={<LoadingPage />}>
      <QueryError>
        <CreateTeam />
      </QueryError>
    </Suspense>
  );
};

export default NewTeam;

export const getServerSideProps: GetServerSideProps = requireAuthentication(
  async (context: GetServerSidePropsContext) => {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery('users', () => getAllUsers(context));

    return {
      props: {
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
    };
  },
);
