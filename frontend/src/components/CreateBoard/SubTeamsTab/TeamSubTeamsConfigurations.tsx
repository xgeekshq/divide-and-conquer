import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { styled } from 'styles/stitches/stitches.config';

import { getAllTeams } from 'api/teamService';
import Icon from 'components/icons/Icon';
import Box from 'components/Primitives/Box';
import Flex from 'components/Primitives/Flex';
import Text from 'components/Primitives/Text';
import Tooltip from 'components/Primitives/Tooltip';
import {
	CreateBoardData,
	createBoardDataState,
	createBoardError
} from 'store/createBoard/atoms/create-board.atom';
import { Team } from 'types/team/team';
import { TeamUser } from 'types/team/team.user';
import { User } from 'types/user/user';
import { TeamUserRoles } from 'utils/enums/team.user.roles';
import MainBoardCard from './MainBoardCard';
import QuickEditSubTeams from './QuickEditSubTeams';

const StyledBox = styled(Flex, Box, { borderRadius: '$12', backgroundColor: 'white' });

type TeamSubTeamsInterface = {
	timesOpen: number;
	setTimesOpen: () => void;
};

const TeamSubTeamsConfigurations: React.FC<TeamSubTeamsInterface> = ({
	timesOpen,
	setTimesOpen
}) => {
	const [stakeholders, setStakeholders] = useState<User[]>([]);
	const [team, setTeam] = useState<Team | null>(null);

	const { data: teams } = useQuery(['teams'], () => getAllTeams(), { suspense: false });

	const setBoardData = useSetRecoilState<CreateBoardData>(createBoardDataState);
	const [haveError, setHaveError] = useRecoilState(createBoardError);

	const MIN_MEMBERS = 4;

	useEffect(() => {
		const isTeamsValid = Array.isArray(teams) && teams.length > 0;

		if (
			isTeamsValid &&
			teams[0].users?.filter((user) => user.role !== TeamUserRoles.STAKEHOLDER).length >=
				MIN_MEMBERS
		) {
			const selectedTeam = teams[0];

			const isStakeholder = (userTeam: TeamUser): boolean =>
				userTeam.role === TeamUserRoles.STAKEHOLDER;
			const getStakeholder = ({ user }: TeamUser): User => user;
			const stakeholdersFound = selectedTeam.users.filter(isStakeholder).map(getStakeholder);

			setBoardData((prev) => ({ ...prev, board: { ...prev.board, team: selectedTeam._id } }));
			setStakeholders(stakeholdersFound);
			setTeam(selectedTeam);
		} else {
			setHaveError(true);
		}
	}, [teams, setBoardData, setHaveError]);

	useEffect(() => {
		if (timesOpen < 2) {
			setTimesOpen();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Flex css={{ mt: '$32' }} direction="column">
			<Flex gap="22" justify="between" css={{ width: '100%' }}>
				<StyledBox
					elevation="1"
					direction="column"
					gap="2"
					css={{ width: '100%', py: '$12', pl: '$17', pr: '$16' }}
				>
					<Text size="xs" color="primary300">
						Team
					</Text>
					<Flex gap="8" align="center">
						<Text size="md">{haveError || !team ? '' : team?.name}</Text>
						<Text size="md" color="primary300">
							({haveError || !team ? '--' : team?.users.length} members)
						</Text>
						<Tooltip content="All active members on the platform">
							<div>
								<Icon
									name="info"
									css={{
										width: '$14',
										height: '$14',
										color: '$primary400'
									}}
								/>
							</div>
						</Tooltip>
					</Flex>
				</StyledBox>
				<StyledBox
					elevation="1"
					direction="column"
					gap="2"
					css={{ width: '100%', py: '$12', pl: '$17', pr: '$16' }}
				>
					<Text size="xs" color="primary300">
						Stakeholders
					</Text>
					<Text size="md" css={{ wordBreak: 'break-word' }}>
						{haveError || !stakeholders
							? ''
							: stakeholders.map(
									({ firstName, lastName }) => `${firstName} ${lastName}`
							  )}
					</Text>
				</StyledBox>
			</Flex>
			{team && (
				<>
					<Flex justify="end">
						<QuickEditSubTeams team={team} />
					</Flex>
					<MainBoardCard timesOpen={timesOpen} team={team} />
				</>
			)}
		</Flex>
	);
};

export default TeamSubTeamsConfigurations;
