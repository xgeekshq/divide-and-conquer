import React, { Dispatch, SetStateAction } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { usersListState } from '@/store/team/atom/team.atom';
import { toastState } from '@/store/toast/atom/toast.atom';
import { ToastStateEnum } from '@/utils/enums/toast-types';
import ListMembersDialog from '@/components/Teams/CreateTeam/ListMembersDialog';
import { createBoardDataState } from '@/store/createBoard/atoms/create-board.atom';
import { BoardUserRoles } from '@/utils/enums/board.user.roles';
import { useSession } from 'next-auth/react';
import { UserList } from '@/types/team/userList';

type ListParticipantsProps = {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
};

const ListParticipants = ({ isOpen, setIsOpen }: ListParticipantsProps) => {
  const { data: session } = useSession();

  const [usersList, setUsersList] = useRecoilState(usersListState);
  const setCreateBoardData = useSetRecoilState(createBoardDataState);

  const setToastState = useSetRecoilState(toastState);

  const saveParticipants = (checkedUserList: UserList[]) => {
    const selectedUsers = checkedUserList.filter((user) => user.isChecked);
    const checkedUsersListToBeSorted = [...checkedUserList];

    setUsersList(
      checkedUsersListToBeSorted.sort((a, b) => Number(b.isChecked) - Number(a.isChecked)),
    );

    const users = selectedUsers.map((user) =>
      user._id === session?.user.id
        ? { role: BoardUserRoles.RESPONSIBLE, user: user._id, votesCount: 0 }
        : {
            role: BoardUserRoles.MEMBER,
            user: user._id,
            votesCount: 0,
          },
    );

    setCreateBoardData((prev) => ({
      ...prev,
      users,
      board: { ...prev.board, team: null },
    }));

    setToastState({
      open: true,
      content: 'Board participant/s successfully updated',
      type: ToastStateEnum.SUCCESS,
    });

    setIsOpen(false);
  };

  return (
    <ListMembersDialog
      usersList={usersList}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      saveUsers={saveParticipants}
      title="Board Participants"
      btnTitle="Add/remove participants"
    />
  );
};

export default ListParticipants;
