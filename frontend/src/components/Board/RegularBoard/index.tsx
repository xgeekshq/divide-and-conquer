import { useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { Container } from '@/styles/pages/boards/board.styles';

import DragDropArea from '@/components/Board/DragDropArea';
import { BoardSettings } from '@/components/Board/Settings';
import Timer from '@/components/Board/Timer';
import Icon from '@/components/Primitives/Icon';
import LoadingPage from '@/components/Primitives/Loading/Page';
import Button from '@/components/Primitives/Button';
import Flex from '@/components/Primitives/Flex';
import { boardInfoState } from '@/store/board/atoms/board.atom';
import EmitEvent from '@/types/events/emit-event.type';
import ListenEvent from '@/types/events/listen-event.type';
import { BoardUserRoles } from '@/utils/enums/board.user.roles';
import { useSession } from 'next-auth/react';
import RegularBoardHeader from './ReagularHeader';

type RegularBoardProps = {
  socketId?: string;
  listenEvent: ListenEvent;
  emitEvent: EmitEvent;
};

const RegularBoard = ({ socketId, emitEvent, listenEvent }: RegularBoardProps) => {
  // States
  // State or open and close Board Settings Dialog
  const [isOpen, setIsOpen] = useState(false);

  // Recoil States
  const { board } = useRecoilValue(boardInfoState);

  // Session Details
  const { data: session } = useSession({ required: true });

  const userId = session?.user.id;

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
  const hasAdminRole = isStakeholderOrAdmin || session?.user.isSAdmin || isOwner || isResponsible;

  const userIsInBoard = useMemo(
    () => board.users.find((user) => user.user._id === userId),
    [board.users, userId],
  );

  const handleOpen = () => {
    setIsOpen(true);
  };

  if (!userIsInBoard && !hasAdminRole) return <LoadingPage />;
  return board && userId && socketId ? (
    <>
      <RegularBoardHeader />
      <Container direction="column">
        <Flex gap={40} align="center" css={{ py: '$32', width: '100%' }} justify="end">
          <Flex css={{ flex: 1 }} />
          {!board?.submitedAt && (
            <Flex css={{ flex: 1 }}>
              <Timer
                boardId={board._id}
                isAdmin={hasAdminRole}
                emitEvent={emitEvent}
                listenEvent={listenEvent}
              />
            </Flex>
          )}
          {hasAdminRole && !board?.submitedAt && (
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
                  isSAdmin={session?.user.isSAdmin}
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
      </Container>
    </>
  ) : (
    <LoadingPage />
  );
};

export default RegularBoard;
