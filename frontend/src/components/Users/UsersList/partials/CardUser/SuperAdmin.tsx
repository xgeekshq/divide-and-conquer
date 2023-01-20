import Flex from '@/components/Primitives/Flex';
import Text from '@/components/Primitives/Text';
import { useState } from 'react';

import useUser from '@/hooks/useUser';
import { UpdateUserIsAdmin } from '@/types/user/user';
import { ConfigurationSwitchSettings } from '@/components/Board/Settings/partials/ConfigurationSettings/ConfigurationSwitch';

type SuperAdminProps = {
  userSAdmin: boolean;
  loggedUserSAdmin: boolean | undefined;
  userId: string;
  loggedUserId: string | undefined;
};

const SuperAdmin = ({ userSAdmin, loggedUserSAdmin, userId, loggedUserId }: SuperAdminProps) => {
  const [checkedState, setCheckedState] = useState(userSAdmin);
  const isDisabledState = true;

  const {
    updateUserIsAdmin: { mutateAsync },
  } = useUser();

  const handleSuperAdminChange = async (checked: boolean) => {
    const updateTeamUser: UpdateUserIsAdmin = {
      _id: userId,
      isSAdmin: checked,
    };

    try {
      await mutateAsync(updateTeamUser);
      setCheckedState(checked);
    } catch (error) {
      setCheckedState(!checked);
    }
  };

  if (loggedUserSAdmin) {
    return (
      <Flex css={{ ml: '$2', display: 'flex', alignItems: 'center' }}>
        <ConfigurationSwitchSettings
          handleCheckedChange={handleSuperAdminChange}
          isChecked={checkedState}
          text=""
          title="Super Admin"
          disabled={loggedUserId !== userId ? undefined : isDisabledState}
          styleVariant={loggedUserId !== userId ? undefined : isDisabledState}
          disabledInfo="Can't change your own role"
        />
      </Flex>
    );
  }
  return (
    <Flex css={{ ml: '$20', display: 'flex', alignItems: 'center' }}>
      {userSAdmin && (
        <Text
          css={{
            ml: '$14',
            background: '#E3FFF5',
            borderStyle: 'solid',
            borderColor: '#3EC796',
            borderWidth: 'thin',
            color: '#3EC796',
            borderRadius: '$12',
            padding: '$8',
            height: '1.55rem',
            lineHeight: '$8',
          }}
          size="sm"
          weight="medium"
        >
          SUPER ADMIN
        </Text>
      )}
    </Flex>
  );
};
export default SuperAdmin;
