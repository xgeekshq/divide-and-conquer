// TODO: Test Select Options

import { renderWithProviders } from '@/utils/testing/renderWithProviders';
import Flex from '@/components/Primitives/Layout/Flex/Flex';
import Text from '@/components/Primitives/Text/Text';
import Icon from '@/components/Primitives/Icons/Icon/Icon';
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectTrigger,
  SelectValue,
} from '@/components/Primitives/Inputs/Select/Select';

const DUMMY_OPTIONS = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Banana', value: 'Banana' },
  { label: 'Blueberry', value: 'Blueberry' },
  { label: 'Grapes', value: 'Grapes' },
  { label: 'Pineapple', value: 'Pineapple' },
];

const render = (disabled: boolean) =>
  renderWithProviders(
    <Select disabled={disabled}>
      <SelectTrigger css={{ padding: '$24' }}>
        <Flex direction="column">
          <Text size="md" color="primary300">
            Choose a fruit
          </Text>
          <SelectValue />
        </Flex>
        <SelectIcon className="SelectIcon">
          <Icon name="arrow-down" />
        </SelectIcon>
      </SelectTrigger>
      <SelectContent options={DUMMY_OPTIONS} />
    </Select>,
  );

describe('Components/Primitives/Select', () => {
  it('should render correctly', () => {
    // Arrange
    const disableSelect: boolean = false;
    // Act
    const { getByTestId } = render(disableSelect);
    // Assert
    expect(getByTestId('select')).toBeInTheDocument();
  });

  it('should render placeholder correctly', () => {
    // Arrange
    const disableSelect: boolean = false;
    // Act
    const { getByTestId, getByText } = render(disableSelect);
    // Assert
    expect(getByTestId('select')).toBeInTheDocument();
    expect(getByText('Choose a fruit')).toBeInTheDocument();
  });
});
