import Icon from '@/components/icons/Icon';
import Flex from '@/components/Primitives/Flex';
import { LiWhite, TextWhite } from './styles';

const CreateTeamTipBar = () => (
  <Flex
    direction="column"
    justify="start"
    css={{
      minHeight: 'calc(100vh - $sizes$92 - $sizes$81)',
      backgroundColor: '$primary800',
      padding: '$32',
      paddingTop: '$100',
      maxWidth: '$384',
      right: 0,
      top: '$220',
      bottom: 0,
    }}
  >
    <Icon
      name="blob-idea"
      css={{
        width: '47px',
        height: '$48',
      }}
    />
    <TextWhite heading="6">Team Admin</TextWhite>

    <LiWhite as="span">
      You will be the team admin of this team. You can also choose other team admins later on out of
      your team members.
    </LiWhite>

    <TextWhite css={{ mb: '$8' }} heading="6">
      Stakeholders
    </TextWhite>
    <LiWhite as="span">
      If you select the role <b>stakeholder</b>, this person will not be included in sub-team retros
      later on when you create a SPLIT retrospective.
    </LiWhite>
    <TextWhite css={{ mb: '$8' }} heading="6">
      New Joiner
    </TextWhite>
    <LiWhite as="span">
      The new joiner will not be selected as a responsible for the SPLIT sub-teams.
    </LiWhite>
  </Flex>
);

export default CreateTeamTipBar;
