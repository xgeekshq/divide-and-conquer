import { useCallback, useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { dehydrate, QueryClient } from 'react-query';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	ButtonsContainer,
	Container,
	ContentContainer,
	InnerContent,
	PageHeader,
	StyledForm,
	SubContainer
} from 'styles/pages/boards/new.styles';

import { getStakeholders } from 'api/boardService';
import { getAllTeams } from 'api/teamService';
import BoardName from 'components/CreateBoard/BoardName';
import FakeSettingsTabs from 'components/CreateBoard/fake/FakeSettingsTabs';
import SettingsTabs from 'components/CreateBoard/SettingsTabs';
import TipBar from 'components/CreateBoard/TipBar';
import requireAuthentication from 'components/HOC/requireAuthentication';
import Icon from 'components/icons/Icon';
import AlertBox from 'components/Primitives/AlertBox';
import Button from 'components/Primitives/Button';
import Text from 'components/Primitives/Text';
import useBoard from 'hooks/useBoard';
import SchemaCreateBoard from 'schema/schemaCreateBoardForm';
import { createBoardDataState, createBoardError } from 'store/createBoard/atoms/create-board.atom';
import { toastState } from 'store/toast/atom/toast.atom';
import { CreateBoardDto } from 'types/board/board';
import { ToastStateEnum } from 'utils/enums/toast-types';

const NewBoard = () => {
	const router = useRouter();

	/**
	 * Recoil Atoms and Hooks
	 */
	const setToastState = useSetRecoilState(toastState);
	const boardState = useRecoilValue(createBoardDataState);
	const resetBoardState = useResetRecoilState(createBoardDataState);
	const haveError = useRecoilValue(createBoardError);

	/**
	 * User Board Hook
	 */
	const {
		createBoard: { status, mutate }
	} = useBoard({ autoFetchBoard: false });

	/**
	 * React Hook Form
	 */
	const methods = useForm<{ text: string; maxVotes: string }>({
		mode: 'onBlur',
		reValidateMode: 'onBlur',
		defaultValues: {
			text: '',
			maxVotes: String(boardState.board.maxVotes) ?? ''
		},
		resolver: zodResolver(SchemaCreateBoard)
	});

	const mainBoardName = useWatch({
		control: methods.control,
		name: 'text'
	});

	/**
	 * Handle back to previous route
	 */
	const handleBack = useCallback(() => {
		resetBoardState();
		router.back();
	}, [router, resetBoardState]);

	/**
	 * Save board
	 * @param title Board Title
	 * @param maxVotes Maxium number of votes allowed
	 */
	const saveBoard = (title: string, maxVotes: string) => {
		const newDividedBoards: CreateBoardDto[] = boardState.board.dividedBoards.map(
			(subBoard) => {
				const newSubBoard: CreateBoardDto = { ...subBoard, users: [], dividedBoards: [] };
				newSubBoard.hideCards = boardState.board.hideCards;
				newSubBoard.hideVotes = boardState.board.hideVotes;
				newSubBoard.postAnonymously = boardState.board.postAnonymously;
				newSubBoard.maxVotes = maxVotes;

				const users = subBoard.users.map((boardUser) => ({
					user: boardUser.user._id,
					role: boardUser.role
				}));

				newSubBoard.users = users;

				return newSubBoard;
			}
		);

		mutate({
			...boardState.board,
			users: boardState.users,
			title,
			dividedBoards: newDividedBoards,
			maxVotes,
			maxUsers: boardState.count.maxUsersCount.toString()
		});
	};

	useEffect(() => {
		if (status === 'success') {
			setToastState({
				open: true,
				content: 'Board created with success!',
				type: ToastStateEnum.SUCCESS
			});

			resetBoardState();
			router.push('/boards');
		}
	}, [status, resetBoardState, router, setToastState]);

	return (
		<Container>
			<PageHeader>
				<Text heading={3} weight="bold" color="primary800">
					Add new SPLIT board
				</Text>

				<Button isIcon onClick={handleBack}>
					<Icon name="close" />
				</Button>
			</PageHeader>
			<ContentContainer>
				<SubContainer>
					{haveError && (
						<AlertBox
							css={{
								marginTop: '$20'
							}}
							type="error"
							title="No team yet!"
							text="In order to create a SPLIT retrospective, you need to have a team with an amount of people big enough to be splitted into smaller sub-teams. Also you need to be team-admin to create SPLIT retrospectives."
						/>
					)}

					<StyledForm
						status={!haveError}
						direction="column"
						onSubmit={
							!haveError
								? methods.handleSubmit(({ text, maxVotes }) =>
										saveBoard(text, maxVotes)
								  )
								: undefined
						}
					>
						<InnerContent direction="column">
							<FormProvider {...methods}>
								<BoardName mainBoardName={mainBoardName} />
								{haveError ? <FakeSettingsTabs /> : <SettingsTabs />}
							</FormProvider>
						</InnerContent>
						<ButtonsContainer justify="end" gap="24">
							<Button type="button" variant="lightOutline" onClick={handleBack}>
								Cancel
							</Button>
							<Button type="submit">Create board</Button>
						</ButtonsContainer>
					</StyledForm>
				</SubContainer>
				<TipBar />
			</ContentContainer>
		</Container>
	);
};

export default NewBoard;

export const getServerSideProps: GetServerSideProps = requireAuthentication(
	async (context: GetServerSidePropsContext) => {
		const queryClient = new QueryClient();
		await queryClient.prefetchQuery('teams', () => getAllTeams(context));
		await queryClient.prefetchQuery('stakeholders', () => getStakeholders(context));

		return {
			props: {
				dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient)))
			}
		};
	}
);
