import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useSetRecoilState } from 'recoil';
import { zodResolver } from '@hookform/resolvers/zod';

import { styled } from 'styles/stitches/stitches.config';

import LogoIcon from 'components/icons/Logo';
import Button from 'components/Primitives/Button';
import Flex from 'components/Primitives/Flex';
import Input from 'components/Primitives/Input';
import Text from 'components/Primitives/Text';
import useUser from 'hooks/useUser';
import SchemaResetPasswordForm from 'schema/schemaResetPasswordForm';
import { toastState } from 'store/toast/atom/toast.atom';
import { NewPassword } from 'types/user/user';
import { ToastStateEnum } from 'utils/enums/toast-types';

const MainContainer = styled('form', Flex, {
	width: '$500',
	backgroundColor: '$white',
	boxShadow: '0px 4px 54px rgba(0, 0, 0, 0.5)',
	borderRadius: '$12',
	py: '$48',
	px: '$32'
});

interface ResetPasswordProps {
	token: string;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token }) => {
	const setToastState = useSetRecoilState(toastState);
	const router = useRouter();
	const methods = useForm<NewPassword>({
		mode: 'onBlur',
		reValidateMode: 'onBlur',
		defaultValues: {
			password: '',
			passwordConf: ''
		},
		resolver: zodResolver(SchemaResetPasswordForm)
	});

	const { resetPassword } = useUser();

	const handleRecoverPassword = async (params: NewPassword) => {
		params.token = token;
		const res = await resetPassword.mutateAsync({ ...params, token });
		if (!res.message) {
			setToastState({
				open: true,
				type: ToastStateEnum.ERROR,
				content: 'Something went wrong,please try again.'
			});
			return;
		}

		router.push('/');
		setToastState({
			open: true,
			type: ToastStateEnum.SUCCESS,
			content: 'Password updated successfully'
		});
	};

	return (
		<MainContainer
			direction="column"
			onSubmit={methods.handleSubmit((params) => {
				handleRecoverPassword(params);
			})}
		>
			<FormProvider {...methods}>
				<LogoIcon />
				<Text css={{ mt: '$24' }} heading="1">
					Reset Password
				</Text>
				<Text size="md" css={{ mt: '$8', color: '$primary500' }}>
					Enter your new password
				</Text>
				<Input
					css={{ mt: '$32' }}
					id="newPassword"
					type="password"
					placeholder="Type password here"
					icon="eye"
					iconPosition="right"
					helperText="Your Password must be at least 8 characters long"
				/>
				<Input
					id="newPasswordConf"
					type="password"
					placeholder="Repeat password"
					icon="eye"
					iconPosition="right"
					helperText="Your Password must be at least 8 characters long"
				/>
				<Button
					type="submit"
					size="lg"
					css={{
						fontWeight: '$medium',
						fontSize: '$18'
					}}
				>
					Recover password
				</Button>
			</FormProvider>
		</MainContainer>
	);
};

export default ResetPassword;
