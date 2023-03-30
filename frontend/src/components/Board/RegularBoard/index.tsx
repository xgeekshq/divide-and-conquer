import DragDropArea from '@/components/Board/DragDropArea';
import { BoardSettings } from '@/components/Board/Settings';
import Timer from '@/components/Board/Timer';
import Icon from '@/components/Primitives/Icons/Icon/Icon';
import Button from '@/components/Primitives/Inputs/Button/Button';
import Flex from '@/components/Primitives/Layout/Flex/Flex';
import LoadingPage from '@/components/Primitives/Loading/Page/Page';
import { boardInfoState } from '@/store/board/atoms/board.atom';
import { EmitEvent } from '@/types/events/emit-event.type';
import { ListenEvent } from '@/types/events/listen-event.type';
import { BoardUserRoles } from '@/utils/enums/board.user.roles';
import { useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import RegularBoardHeader from './RegularHeader';

type RegularBoardProps = {
  socketId?: string;
  listenEvent: ListenEvent;
  emitEvent: EmitEvent;
  userId: string;
  userSAdmin?: boolean;
};

const RegularBoard = ({
  socketId,
  emitEvent,
  listenEvent,
  userId,
  userSAdmin,
}: RegularBoardProps) => {
  // States
  // State or open and close Board Settings Dialog
  const [isOpen, setIsOpen] = useState(false);

  // Recoil States
  const { board } = useRecoilValue(boardInfoState);

  // Board Settings permissions
  const isStakeholderOrAdmin = useMemo(
    () =>
      board.users.some(
        (boardUser) =>
          [BoardUserRoles.STAKEHOLDER, BoardUserRoles.RESPONSIBLE].includes(boardUser.role) &&
          boardUser.user._id === userId,
      ),
    [board.users, userId],
  );

  const [isResponsible, isOwner] = useMemo(
    () =>
      board
        ? [
            board.users.some(
              (boardUser) =>
                boardUser.role === BoardUserRoles.RESPONSIBLE && boardUser.user._id === userId,
            ),
            board.createdBy._id === userId,
          ]
        : [false, false],
    [board, userId],
  );

  // Show board settings button if current user is allowed to edit
  const hasAdminRole = isStakeholderOrAdmin || userSAdmin || isOwner || isResponsible;

  const shouldRenderBoardSettings = hasAdminRole && !board?.submitedAt;

  const userIsInBoard = useMemo(
    () => board.users.find((user) => user.user._id === userId),
    [board.users, userId],
  );

  const handleOpen = () => {
    setIsOpen(true);
  };

  if ((!userIsInBoard && !hasAdminRole) || !board || !userId || !socketId) return <LoadingPage />;
  return board && userId && socketId ? (
    <>
      <RegularBoardHeader />
      <Flex direction="column" align="start" justify="center" css={{ px: '$36' }}>
        <Flex gap={40} align="center" css={{ py: '$32', width: '100%' }} justify="end">
          {shouldRenderBoardSettings && <Flex css={{ flex: 1 }} />}
          {!board?.submitedAt && (
            <Flex
              css={{
                flex: 1,
                justifyContent: shouldRenderBoardSettings ? 'normal' : 'center',
              }}
            >
              <Timer
                boardId={board._id}
                isAdmin={hasAdminRole}
                emitEvent={emitEvent}
                listenEvent={listenEvent}
              />
            </Flex>
          )}
          {shouldRenderBoardSettings && (
            <>
              <Button onClick={handleOpen} variant="primaryOutline">
                <Icon name="settings" />
                Board settings
                <Icon name="arrow-down" />
              </Button>
              {isOpen && (
                <BoardSettings
                  isOpen={isOpen}
                  isOwner={isOwner}
                  isResponsible={isResponsible}
                  isSAdmin={userSAdmin}
                  isStakeholderOrAdmin={isStakeholderOrAdmin}
                  setIsOpen={setIsOpen}
                  socketId={socketId}
                  isRegularBoard
                />
              )}
            </>
          )}
        </Flex>
        <DragDropArea
          board={board}
          socketId={socketId}
          userId={userId}
          isRegularBoard
          hasAdminRole={hasAdminRole}
        />
      </Flex>
    </>
  ) : (
    <LoadingPage />
  );
};

export default RegularBoard;
