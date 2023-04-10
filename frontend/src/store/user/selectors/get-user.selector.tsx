import { selector } from 'recoil';

import { userState } from '@/store/user/atoms/user.atom';

export const getUserSelector = selector({
  key: 'getUser', // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => get(userState),
});
