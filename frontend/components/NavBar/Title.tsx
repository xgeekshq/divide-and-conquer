import { useRouter } from "next/router";
import { useState } from "react";
import { useStoreContext } from "../../store/store";
import { CheckIsBoardPage, GetPageTitleByUrl } from "../../utils/routes";
import Text from "../Primitives/Text";

const Title: React.FC = () => {
  const router = useRouter();
  const {
    state: { board },
  } = useStoreContext();
  const [editTitle, setEditTitle] = useState(false);

  const isBoardPage = CheckIsBoardPage(router.pathname);

  if (isBoardPage && editTitle && board) {
    return <span>{board.title}</span>;
  }

  const handleSetEditTitle = () => {
    setEditTitle(true);
  };

  return (
    <Text fontWeight="semiBold" size="18" onClick={handleSetEditTitle}>
      {!isBoardPage ? GetPageTitleByUrl(router.pathname) : board?.title}
    </Text>
  );
};

export default Title;
