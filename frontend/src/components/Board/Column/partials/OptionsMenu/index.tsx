import Icon from '@/components/icons/Icon';
import Flex from '@/components/Primitives/Flex';
import { Popover, PopoverContent } from '@/components/Primitives/Popover';
import Separator from '@/components/Primitives/Separator';
import Text from '@/components/Primitives/Text';
import useColumn from '@/hooks/useColumn';
import CardType from '@/types/card/card';
import { useState } from 'react';
import ColorSquare from '../ColorSquare';
import { SwitchDefaultText } from '../SwitchDefaultText';
import { PopoverItemStyled, PopoverTriggerStyled } from './styles';

type OptionsMenuProps = {
  disabled?: boolean;
  cards: CardType[];
  title: string;
  columnId: string;
  color: string;
  boardId: string;
  cardText?: string;
  setOpenDialogName: (open: boolean, type: string) => void;
  isDefaultText?: boolean;
};

export const colors = [
  '$highlight1Light',
  '$highlight2Light',
  '$highlight3Light',
  '$highlight4Light',
  '$infoLighter',
  '$warningLighter',
];

const OptionsMenu = ({
  disabled,
  cards,
  title,
  columnId,
  color,
  cardText,
  boardId,
  isDefaultText,
  setOpenDialogName,
}: OptionsMenuProps) => {
  const [openPopover, setOpenPopover] = useState(false);

  const {
    updateColumn: { mutate },
  } = useColumn();

  const handleDefaultTextCheck = () => {
    const column = {
      _id: columnId,
      title,
      color,
      cards,
      cardText,
      boardId,
      isDefaultText: !isDefaultText,
    };

    mutate(column);
  };

  const handleColorChange = (selectedColor: string) => {
    const column = {
      _id: columnId,
      title,
      color: selectedColor,
      cards,
      cardText,
      boardId,
      isDefaultText,
    };

    mutate(column);
  };

  const handleOpen = (type: string) => {
    setOpenDialogName(true, type);
    setOpenPopover(false);
  };

  const handleOpenPopover = (value: boolean) => setOpenPopover(value);

  return (
    <>
      <Popover open={openPopover} onOpenChange={handleOpenPopover}>
        <PopoverTriggerStyled disabled={disabled} css={{ ml: '$8' }}>
          <Icon name="menu-dots" size={24} />
        </PopoverTriggerStyled>
        {!disabled && (
          <PopoverContent>
            <PopoverItemStyled onClick={() => handleOpen('ColumnName')}>
              <Icon name="boards" size={24} />
              <Text size="sm">Edit column name </Text>
            </PopoverItemStyled>
            <PopoverItemStyled onClick={() => handleColorChange('$highlight4Light')}>
              <Icon name="recurring" size={24} />
              <Text size="sm">Empty column cards</Text>
            </PopoverItemStyled>
            <PopoverItemStyled>
              <Flex align="center" gap={8}>
                <Icon name="file-alt" size={24} />
                <Text onClick={() => handleOpen('CardText')} size="sm">
                  Activate card default text
                </Text>

                <SwitchDefaultText
                  handleCheckedChange={handleDefaultTextCheck}
                  isChecked={!isDefaultText}
                  disabled={cardText === 'Write your comment here...'}
                />
              </Flex>
            </PopoverItemStyled>
            <PopoverItemStyled>
              <Icon name="trash-alt" size={24} />
              <Text size="sm">Delete column</Text>
            </PopoverItemStyled>
            <Separator orientation="horizontal" css={{ mt: '$5' }} />
            <Flex gap={8} css={{ pb: '$8', pt: '$20', pl: '$18' }}>
              <Text size="xs" color="primary800" fontWeight="medium">
                Cards color
              </Text>
            </Flex>
            <Flex direction="row" align="center" css={{ pb: '$10', pl: '$3' }}>
              {colors.map((square) => (
                <ColorSquare key={square} color={square} handleColorChange={handleColorChange} />
              ))}
            </Flex>
          </PopoverContent>
        )}
      </Popover>
    </>
  );
};

export default OptionsMenu;
