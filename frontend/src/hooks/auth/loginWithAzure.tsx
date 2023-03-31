import { signIn } from 'next-auth/react';

import { RedirectableProviderType } from 'next-auth/providers';
import { DASHBOARD_ROUTE } from '@/utils/routes';

const loginWithAzure = async () => {
  signIn<RedirectableProviderType>('azure-ad', {
    callbackUrl: DASHBOARD_ROUTE,
    redirect: true,
  });
};

export default loginWithAzure;
