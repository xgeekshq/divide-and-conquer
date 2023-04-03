import { createMockRouter } from '@/utils/testing/mocks';
import { renderWithProviders } from '@/utils/testing/renderWithProviders';
import { fireEvent, waitFor } from '@testing-library/dom';
import Dialog, { DialogProps } from './Dialog';
import { HeaderProps } from './DialogHeader';
import { FooterProps } from './DialogFooter';

const router = createMockRouter({});

const render = ({
  isOpen = true,
  setIsOpen = jest.fn(),
  title = 'Title',
  children = 'Content',
  ...props
}: Partial<DialogProps & HeaderProps & FooterProps> = {}) =>
  renderWithProviders(
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <Dialog.Header title={title} />
      {children}
      <Dialog.Footer
        handleClose={jest.fn()}
        handleAffirmative={jest.fn()}
        affirmativeLabel="Confirm"
        {...props}
      />
    </Dialog>,
    { routerOptions: router },
  );

describe('Components/Primitives/Dialogs/Dialog', () => {
  it('should render correctly', () => {
    // Act
    const { getByText } = render();

    // Assert
    expect(getByText('Content')).toBeInTheDocument();
    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('Confirm')).toBeInTheDocument();
  });

  it('should call handleAffirmative', async () => {
    // Arrange
    const handleAffirmative = jest.fn();

    // Act
    const { getByText } = render({ handleAffirmative });
    fireEvent.click(getByText('Confirm'));

    // Assert
    await waitFor(() => {
      expect(handleAffirmative).toHaveBeenCalled();
    });
  });

  it('should call handleClose', async () => {
    // Arrange
    const handleClose = jest.fn();

    // Act
    const { getByText } = render({ handleClose });
    fireEvent.click(getByText('Cancel'));

    // Assert
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
