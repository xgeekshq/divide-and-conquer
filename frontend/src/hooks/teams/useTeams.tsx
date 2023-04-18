import { useQuery } from '@tanstack/react-query';
import { useSetRecoilState } from 'recoil';

import { getAllTeams, getUserTeams } from '@/api/teamService';
import { createErrorMessage } from '@/constants/toasts';
import { ErrorMessages } from '@/constants/toasts/teams-messages';
import { toastState } from '@/store/toast/atom/toast.atom';
import { TEAMS_KEY } from '@/utils/constants/reactQueryKeys';

const useTeams = (isSAdmin: boolean) => {
  const setToastState = useSetRecoilState(toastState);

  return useQuery(
    [TEAMS_KEY],
    () => {
      if (isSAdmin) {
        return getAllTeams();
      }
      return getUserTeams();
    },
    {
      enabled: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onError: () => {
        setToastState(createErrorMessage(ErrorMessages.GET));
      },
    },
  );
};

export default useTeams;
