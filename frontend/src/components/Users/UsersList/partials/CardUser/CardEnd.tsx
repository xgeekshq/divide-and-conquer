import React from 'react';

import Flex from '@/components/Primitives/Flex';
import Separator from '@/components/Primitives/Separator';
import { User } from '@/types/user/user';
import DeleteUser from './DeleteUser';
import EditUser from './EditUser';

type CardEndProps = {
  user: User;
};

const CardEnd: React.FC<CardEndProps> = React.memo(({ user }) => (
  <Flex css={{ alignItems: 'center' }}>
    <Separator orientation="vertical" size="lg" css={{ ml: '$20' }} />
    <Flex align="center" css={{ ml: '$24' }} gap="24">
      <EditUser user={user} />
    </Flex>
    <Flex align="center" css={{ ml: '$24' }} gap="24">
      <DeleteUser userId={user._id} firstName={user.firstName} lastName={user.lastName} />
    </Flex>
  </Flex>
));

export default CardEnd;
