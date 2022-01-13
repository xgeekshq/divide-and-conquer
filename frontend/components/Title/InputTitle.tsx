import { Dispatch, SetStateAction, useState } from "react";
import { CheckIcon, Cross2Icon } from "@modulz/radix-icons";
import { styled } from "../../stitches.config";
import TextField from "../Primitives/TextField";
import Button from "../Primitives/Button";
import useBoard from "../../hooks/useBoard";
import BoardType from "../../types/board/board";
import Flex from "../Primitives/Flex";
import ToastMessage from "../../utils/toast";

const ActionButton = styled(Button, {});

const Container = styled(Flex, { width: "100%", border: "1px solid black" });

interface InputTitleBoard {
  board: BoardType;
  onClickEdit: Dispatch<SetStateAction<boolean>>;
  isBoardPage: boolean;
}

const InputTitle: React.FC<InputTitleBoard> = ({ board, onClickEdit, isBoardPage }) => {
  const [title, setTitle] = useState("");
  const { updateBoard } = useBoard({ autoFetchBoard: false, autoFetchBoards: false }, board._id);

  const handleUpdateTitle = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    onClickEdit(false);
    if (title.length === 0) {
      ToastMessage("Title cannot be empty", "error");
      return;
    }
    if (title !== board.title && board._id) {
      updateBoard.mutate({
        board: { ...board, title },
        boardPage: isBoardPage,
      });
    }
  };

  const handleStopPropagationOnTextField = (event: React.MouseEvent<HTMLInputElement>) => {
    event.stopPropagation();
  };

  const handleCancelEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClickEdit(false);
  };

  return (
    <Container
      wrap="noWrap"
      onBlur={(e) => {
        e.stopPropagation();
      }}
    >
      <TextField
        css={{
          pointerEvents: "all",
          width: "100%",
          border: "none",
          outline: "none",
          "&:focus": { outline: "none", border: "none", boxShadow: "none" },
        }}
        placeholder={board.title}
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onClick={handleStopPropagationOnTextField}
        onKeyPress={(e) => e.stopPropagation()}
      />
      <Flex wrap="noWrap">
        <ActionButton
          color="green"
          css={{
            width: "$20",
            borderLeft: "1px solid black",
            color: "black",
            pointerEvents: "visible",
          }}
          onClick={handleUpdateTitle}
        >
          <CheckIcon />
        </ActionButton>
        <ActionButton
          color="red"
          css={{
            width: "$20",
            borderLeft: "1px solid black",
            color: "black",
            pointerEvents: "all",
          }}
          onClick={handleCancelEdit}
        >
          <Cross2Icon />
        </ActionButton>
      </Flex>
    </Container>
  );
};
export default InputTitle;
