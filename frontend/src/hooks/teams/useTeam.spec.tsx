import { renderHook, waitFor } from '@testing-library/react';
import {
  RenderHookWithProvidersOptions,
  renderHookWithProviders,
} from '@/utils/testing/renderHookWithProviders';
import { TeamFactory } from '@/utils/factories/team';
import { getTeam } from '@/api/teamService';
import { Team } from '@/types/team/team';
import { ToastStateEnum } from '@/utils/enums/toast-types';
import { toastState } from '@/store/toast/atom/toast.atom';
import useTeam from '@/hooks/teams/useTeam';

const DUMMY_TEAM = TeamFactory.create();

const mockGetTeam = getTeam as jest.Mock<Promise<Team>>;

jest.mock('@/api/teamService');

const render = (teamId: string, options?: Partial<RenderHookWithProvidersOptions>) =>
  renderHook(() => useTeam(teamId), { wrapper: renderHookWithProviders(options) });

describe('Hooks/Teams/useTeam', () => {
  beforeEach(() => {
    mockGetTeam.mockReturnValue(Promise.resolve(DUMMY_TEAM));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch team', async () => {
    const { result } = render('thisIsTheTeamId');

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(mockGetTeam).toBeCalled();
    expect(result.current.data).toBe(DUMMY_TEAM);
  });

  it('should set toast error', async () => {
    mockGetTeam.mockReturnValueOnce(Promise.reject(new Error('Failed to fetch team')));
    const recoilHandler = jest.fn();

    // Act
    const { result } = render('thisIsTheTeamId', {
      recoilOptions: { recoilState: toastState, recoilHandler },
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
      expect(result.current.data).not.toBeDefined();
      expect(recoilHandler).toHaveBeenCalledWith({
        open: true,
        content: 'Error getting the team',
        type: ToastStateEnum.ERROR,
      });
    });
  });
});
