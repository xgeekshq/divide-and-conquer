import { ChangeEvent, useEffect, useState } from 'react';

import { styled } from 'styles/stitches/stitches.config';

import Icon from 'components/icons/Icon';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogTrigger
} from 'components/Primitives/AlertDialog';
import Flex from 'components/Primitives/Flex';
import Separator from 'components/Primitives/Separator';
import Text from 'components/Primitives/Text';
import useCreateBoard from 'hooks/useCreateBoard';
import { Team } from 'types/team/team';
import isEmpty from 'utils/isEmpty';

interface QuickEditSubTeamsProps {
	team: Team;
}

const StyledInput = styled('input', {
	display: 'flex',
	fontSize: '$16',
	px: '$16',
	boxShadow: '0',
	border: '1px solid $primary200',
	outline: 'none',
	width: '100%',
	borderRadius: '$4',
	lineHeight: '$20',
	height: '$56',
	'input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button':
		{
			'-webkit-appearance': 'none',
			margin: 0
		},
	'input[type=number]': {
		'-moz-appearance': 'textfield'
	},
	'&:focus': {
		borderColor: '$primary400',
		boxShadow: '0px 0px 0px 2px $colors$primaryLightest'
	},
	'&:-webkit-autofill': {
		'-webkit-box-shadow': '0 0 0px 1000px white inset, 0px 0px 0px 2px $colors$primaryLightest'
	}
});

const QuickEditSubTeams = ({ team }: QuickEditSubTeamsProps) => {
	const { createBoardData, setCreateBoardData, handleSplitBoards, teamMembers } =
		useCreateBoard(team);

	const {
		count: { teamsCount, maxUsersCount }
	} = createBoardData;
	const teamLength = teamMembers.length ?? 0;
	const minUsers = teamLength % 2 === 0 ? 2 : 3;
	const maxTeams = Math.floor(teamLength / 2);
	const minTeams = 2;
	const maxUsers = Math.ceil(teamLength / 2);

	const [values, setValues] = useState<{
		teamsCount: number | string;
		maxUsersCount: number | string;
	}>({
		teamsCount,
		maxUsersCount
	});

	useEffect(() => {
		setValues({
			teamsCount,
			maxUsersCount
		});
	}, [maxUsersCount, teamsCount]);

	const handleMaxUsersValue = (value: number | string) => {
		if (Number(value) < minUsers) return minUsers;
		if (Number(value) > maxUsers) return maxUsers;
		return value;
	};

	const handleTeamsValue = (value: number | string) => {
		if (Number(value) < minTeams) return minTeams;
		if (Number(value) > maxTeams) return maxTeams;
		return value;
	};

	const handleChangeCountTeams = (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const currentValue = handleTeamsValue(value);
		setValues((prev) => ({
			...prev,
			teamsCount: currentValue,
			maxUsersCount: !isEmpty(value)
				? Math.ceil(teamMembers.length / Number(currentValue))
				: prev.maxUsersCount
		}));
	};

	const handleMaxMembers = (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const currentValue = handleMaxUsersValue(value);
		setValues((prev) => ({
			...prev,
			maxUsersCount: currentValue,
			teamsCount: !isEmpty(value)
				? Math.ceil(teamMembers.length / Number(currentValue))
				: prev.teamsCount
		}));
	};

	const handleSaveConfigs = () => {
		if (isEmpty(values.teamsCount) || isEmpty(values.maxUsersCount)) return;
		setCreateBoardData((prev) => ({
			...prev,
			count: {
				...prev.count,
				teamsCount: Number(values.teamsCount),
				maxUsersCount: Number(values.maxUsersCount)
			},
			board: {
				...prev.board,
				dividedBoards: handleSplitBoards(Number(values.teamsCount))
			}
		}));
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Flex
					align="center"
					gap="8"
					justify="end"
					css={{
						py: '$14',
						cursor: 'pointer',
						transition: 'text-decoration 0.2s ease-in-out',
						'&:hover': {
							'&>span': {
								textDecoration: 'underline'
							}
						}
					}}
				>
					<Icon
						name="edit"
						css={{
							width: '$16',
							height: '$16'
						}}
					/>
					<Text size="sm" weight="medium">
						Quick edit sub-teams configurations
					</Text>
				</Flex>
			</AlertDialogTrigger>
			<AlertDialogContent
				css={{ left: '35% !important', top: '200px', flexDirection: 'column' }}
			>
				<Flex align="center" css={{ px: '$32', py: '$24' }} justify="between">
					<Text heading="4">Quick edit sub-teams configurations</Text>
					<AlertDialogCancel asChild isIcon css={{ p: 0, height: '$24' }}>
						<Flex
							css={{
								'& svg': {
									color: '$primary400',
									width: '$24 !important',
									height: '$24 !important'
								}
							}}
						>
							<Icon name="close" />
						</Flex>
					</AlertDialogCancel>
				</Flex>
				<Separator css={{ backgroundColor: '$primary100' }} />
				<Flex css={{ pt: '$29', px: '$32', pb: '$32' }} direction="column">
					<Flex>
						<Flex css={{ position: 'relative', top: '3px' }}>
							<Icon
								css={{ width: '$16', height: '$16', color: '$primary500' }}
								name="info"
							/>
						</Flex>
						<Text color="primary500" css={{ pl: '$8' }} size="md">
							Note, if you change any of the two values below, the other value will
							adjust accordingly.
						</Text>
					</Flex>
					<Flex css={{ mt: '$24', width: '100%' }} gap="24">
						<Flex css={{ width: '100%' }} direction="column" gap="8">
							<Text label>Sub-teams count</Text>
							<StyledInput
								css={{ mb: 0 }}
								id="teamsCount"
								max={maxTeams}
								min={minTeams}
								placeholder=" "
								type="number"
								value={values.teamsCount}
								onChange={handleChangeCountTeams}
							/>
							<Flex>
								<Text hint css={{ color: '$primary800' }}>
									Min {minTeams}, Max {maxTeams}{' '}
									<Text hint color="primary300">
										sub-teams
									</Text>
								</Text>
							</Flex>
						</Flex>
						<Flex css={{ width: '100%' }} direction="column" gap="8">
							<Text label>Max sub-team members count</Text>
							<StyledInput
								css={{ mb: 0 }}
								id="maxUsers"
								max={maxUsers}
								min={minUsers}
								placeholder=" "
								type="number"
								value={values.maxUsersCount}
								onChange={handleMaxMembers}
							/>
							<Flex>
								<Text hint css={{ color: '$primary800' }}>
									Min {minUsers}, Max {maxUsers}{' '}
									<Text hint color="primary300">
										members per team
									</Text>
								</Text>
							</Flex>
						</Flex>
					</Flex>
					<Flex css={{ mt: '$32' }} gap="24" justify="end">
						<AlertDialogCancel variant="primaryOutline">Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleSaveConfigs}>
							Save configurations
						</AlertDialogAction>
					</Flex>
				</Flex>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default QuickEditSubTeams;
