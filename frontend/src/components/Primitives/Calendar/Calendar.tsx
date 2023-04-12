import { styled } from '@/styles/stitches/stitches.config';
import Icon from '@/components/Primitives/Icons/Icon/Icon';
import Flex from '@/components/Primitives/Layout/Flex/Flex';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import StyledCalendar from '@/components/Primitives/Calendar/StyledCalendar';
import SelectDate from '@/components/Primitives/Inputs/SelectDate/SelectDate';

const StyledContainer = styled(Flex, {
  height: '100%',
  maxWidth: '$364',
  backgroundColor: '$white',
  px: '$40',
  pt: '$24',
  width: '$400',
  position: 'relative',
  borderRadius: '$12',
  boxShadow: '$1 $1 $5 #aaaaaa',
  mt: '$5',
});

export type CalendarProps = {
  currentDate?: Date;
  setDate: (date: Date) => void;
};

const CalendarBar = ({ currentDate, setDate }: CalendarProps) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button
        type="button"
        style={{ padding: '0', backgroundColor: 'transparent', border: 'none' }}
      >
        <SelectDate
          placeholder="Select date"
          currentValue={currentDate?.toLocaleDateString() || ''}
          disabled
        />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Item>
          <StyledContainer direction="column" onClick={(event) => event.stopPropagation()}>
            <StyledCalendar
              minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
              minDetail="year"
              nextLabel={<Icon name="arrow-right" />}
              prevLabel={<Icon name="arrow-left" />}
              value={currentDate}
              formatShortWeekday={(locale: string | undefined, date: Date) =>
                ['Su', 'Mo', 'Th', 'We', 'Th', 'Fr', 'Sa'][date.getDay()]
              }
              onChange={setDate}
            />
          </StyledContainer>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
export default CalendarBar;
