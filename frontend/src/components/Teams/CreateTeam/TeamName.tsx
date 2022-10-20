import Input from '../../Primitives/Input';
import Text from '../../Primitives/Text';

type Props = { teamName: string };

const TeamName = ({ teamName }: Props) => {
	return (
		<>
			<Text css={{ mb: '$16' }} heading="3">
				Team Name
			</Text>

			<Input
				forceState
				currentValue={teamName}
				id="text"
				maxChars="40"
				placeholder="Team name"
				state="default"
				type="text"
			/>
		</>
	);
};

export default TeamName;
