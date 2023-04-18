import { useQuery } from '@tanstack/react-query';
import { useSetRecoilState } from 'recoil';

import { getUserTeams } from '@/api/teamService';
import { createErrorMessage } from '@/constants/toasts';
import { ErrorMessages } from '@/constants/toasts/teams-messages';
import { toastState } from '@/store/toast/atom/toast.atom';
import { TEAMS_KEY, USERS_KEY } from '@/utils/constants/reactQueryKeys';

const useUserTeams = (userId: string) => {
  const setToastState = useSetRecoilState(toastState);

  return useQuery([TEAMS_KEY, USERS_KEY, userId], () => getUserTeams(userId), {
    enabled: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onError: () => {
      setToastState(createErrorMessage(ErrorMessages.GET));
    },
  });
};

export default useUserTeams;
