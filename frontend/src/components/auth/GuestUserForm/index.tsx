import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { joiResolver } from '@hookform/resolvers/joi';
import Input from '@/components/Primitives/Inputs/Input/Input';
import Text from '@/components/Primitives/Text/Text';
import { LoginGuestUser } from '@/types/user/user';
import { START_PAGE_ROUTE } from '@/utils/routes';
import Button from '@/components/Primitives/Inputs/Button/Button';
import Flex from '@/components/Primitives/Layout/Flex/Flex';
import SchemaLoginGuestForm from '@/schema/schemaLoginGuestForm';
import { getUsername } from '@/utils/getUsername';
import useRegisterGuestUser from '@/hooks/auth/useRegisterGuestUser';
import { useEffect } from 'react';
import { OrSeparator, StyledForm } from '@/components/auth/LoginForm/styles';

const GuestUserForm = () => {
  const router = useRouter();
  const board = router.query.boardId;

  const { mutate, status } = useRegisterGuestUser();

  const methods = useForm<LoginGuestUser>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
    },
    resolver: joiResolver(SchemaLoginGuestForm),
  });

  const handleLogin = (username: string) => {
    const user = getUsername(username);

    mutate({ board: String(board), firstName: user.firstName, lastName: user.lastName });
  };

  const handleClick = () => {
    router.push(START_PAGE_ROUTE);
  };

  useEffect(() => {
    if (status === 'success') {
      router.push({ pathname: `/boards/[boardId]`, query: { boardId: board } });
    }
  }, [status]);

  return (
    <FormProvider {...methods}>
      <StyledForm
        autoComplete="off"
        direction="column"
        style={{ width: '100%' }}
        onSubmit={methods.handleSubmit(({ username }) => {
          handleLogin(username);
        })}
      >
        <Text css={{ mt: '$24' }} heading="1">
          Guest User
        </Text>
        <Text size="md" color="primary500" css={{ mt: '$8' }}>
          Enter a guest user name and join the retro.
        </Text>
        <Input css={{ mt: '$32' }} id="username" placeholder="Guest user name" type="text" />

        <Button disabled={status !== 'idle'} size="lg" type="submit">
          Log in as guest
        </Button>
        <Flex align="center" direction="column" justify="center">
          <OrSeparator>
            <hr />
            <Text color="primary300" size="sm" fontWeight="medium">
              or
            </Text>
            <hr />
          </OrSeparator>
          <Button css={{ width: '100%' }} size="lg" onClick={handleClick}>
            Sign In
          </Button>
        </Flex>
      </StyledForm>
    </FormProvider>
  );
};

export default GuestUserForm;
