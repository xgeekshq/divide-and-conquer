import { styled } from 'styles/stitches/stitches.config';

import Icon from 'components/icons/Icon';
import Flex from 'components/Primitives/Flex';
import Text from 'components/Primitives/Text';

const TextWhite = styled(Text, { color: 'white', mt: '$24' });
const LiWhite = styled('li', Text, { color: '$primary100', fontSize: '$14', lineHeight: '$20' });

const CreateTeamTipBar = () => {
	return (
		<Flex
			direction="column"
			justify="center"
			css={{
				minHeight: 'calc(100vh - $sizes$92)',
				backgroundColor: '$primary800',
				padding: '$32',
				maxWidth: '$384',
				position: 'fixed',
				right: 0,
				top: 0,
				bottom: 0
			}}
		>
			<Icon
				name="blob-idea"
				css={{
					width: '47px',
					height: '$48'
				}}
			/>
			<TextWhite heading="6">Team Admin</TextWhite>

			<LiWhite as="span">
				You will be the team admin of this team. You can also choose other team admins later
				on out of your team members.
			</LiWhite>

			<TextWhite css={{ mb: '$8' }} heading="6">
				Stakeholders
			</TextWhite>
			<LiWhite as="span">
				If you select the role <b>stakeholder</b>, this person will not be included in
				sub-team retros later on when you create a SPLIT retrospective.
			</LiWhite>
		</Flex>
	);
};

export default CreateTeamTipBar;
