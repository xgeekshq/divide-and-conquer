import React, { useMemo } from 'react';
import useCurrentSession from '@/hooks/useCurrentSession';

import Icon from '@/components/Primitives/Icons/Icon/Icon';
import Flex from '@/components/Primitives/Layout/Flex/Flex';
import Separator from '@/components/Primitives/Separator/Separator';
import Text from '@/components/Primitives/Text/Text';
import { Team } from '@/types/team/team';
import { TeamUserRoles } from '@/utils/enums/team.user.roles';
import { useRouter } from 'next/router';
import AvatarGroup from '@/components/Primitives/Avatars/AvatarGroup/AvatarGroup';
import { InnerContainer } from '@/styles/pages/pages.styles';

import RoleSelector from '@/components/Teams/Team/TeamMemberItem/RoleSelector/RoleSelector';
import ConfirmationDialog from '@/components/Primitives/Alerts/ConfirmationDialog/ConfirmationDialog';
import Button from '@/components/Primitives/Inputs/Button/Button';
import useTeam from '@/hooks/useTeam';
import TeamTitle from './TeamTitle/TeamTitle';
import TeamBoards from './TeamBoards/TeamBoards';

export type TeamItemProps = {
  team: Team;
};

const TeamItem = React.memo(({ team }: TeamItemProps) => {
  const { id, users: teamUsers, name } = team;

  const { userId, isSAdmin } = useCurrentSession();
  const router = useRouter();
  const isTeamPage = router.pathname.includes('teams');

  const { deleteTeam, deleteTeamUser } = useTeam();

  const userFound = useMemo(() => {
    const queryUserId = router.query.userId;
    const teamUserId = !isTeamPage && queryUserId ? queryUserId : userId;

    return teamUsers.find((teamUser) => String(teamUser.user?._id) === String(teamUserId));
  }, [router, userId, teamUsers]);

  const havePermissions = useMemo(() => {
    if (isSAdmin) {
      return true;
    }

    if (!userFound) {
      return false;
    }

    return [TeamUserRoles.ADMIN, TeamUserRoles.STAKEHOLDER].includes(userFound.role);
  }, [isSAdmin, userFound]);

  const confirmationDialogDescription = () => {
    if (isTeamPage) {
      return (
        <Text>
          Do you really want to delete the team <Text fontWeight="bold">{name}</Text>?
        </Text>
      );
    }
    const userFoundName = (
      <Text fontWeight="bold">
        {userFound?.user.firstName} ${userFound?.user.lastName}
      </Text>
    );

    return (
      <Text>
        Do you really want to remove {userFoundName} from <Text fontWeight="bold">{name}</Text>?
      </Text>
    );
  };

  // CHECK: This function can be abstracted
  // to the Parent and passed as Prop.
  const handleDelete = () => {
    if (isTeamPage) {
      deleteTeam.mutate({ id });
    } else {
      deleteTeamUser.mutate({ teamUserId: userFound?._id });
    }
  };

  return (
    <Flex direction="column" data-testid="teamItem">
      <InnerContainer align="center" elevation="1" gap="40">
        <Flex align="center" gap="8" css={{ flex: '1' }}>
          <Icon
            name="blob-team"
            size={32}
            css={{
              zIndex: 1,
              flexShrink: 0,
            }}
          />

          <TeamTitle teamId={id} title={name} />
        </Flex>
        <Flex align="center" justify="start" gap="40" css={{ flex: '3' }}>
          <Flex align="center" gap="8">
            <Text color="primary300" size="sm">
              Members
            </Text>

            <AvatarGroup listUsers={teamUsers} userId={userId} css={{ minWidth: '$88' }} />
          </Flex>

          <Separator orientation="vertical" size="lg" />

          <Flex align="center" gap="8">
            <Text color="primary300" size="sm">
              Team admin
            </Text>

            <AvatarGroup
              stakeholders
              teamAdmins
              listUsers={teamUsers}
              userId={userId}
              css={{ minWidth: '$88' }}
            />
          </Flex>

          <Separator orientation="vertical" size="lg" />

          <Flex align="center">
            {!isTeamPage && userFound ? (
              <RoleSelector role={userFound.role} userId={userId!} teamId={id} />
            ) : (
              <TeamBoards team={team} havePermissions={havePermissions} />
            )}
          </Flex>
        </Flex>
        <Flex css={{ flex: '0' }}>
          {havePermissions && (
            <ConfirmationDialog
              title={isTeamPage ? 'Delete team' : 'Remove User'}
              description={confirmationDialogDescription()}
              confirmationHandler={handleDelete}
              confirmationLabel={isTeamPage ? 'Delete' : 'Remove'}
              tooltip={isTeamPage ? 'Delete team' : 'Remvove user'}
            >
              <Button isIcon size="sm">
                <Icon
                  name={isTeamPage ? 'trash-alt' : 'user-slash'}
                  css={{
                    color: '$primary400',
                  }}
                />
              </Button>
            </ConfirmationDialog>
          )}
        </Flex>
      </InnerContainer>
    </Flex>
  );
});

export default TeamItem;
