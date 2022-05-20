import { styled } from '../../../stitches.config';
import Flex from '../../Primitives/Flex';

const CardsContainer = styled(Flex, {
	mt: '$20',
	px: '$20',
	overflowY: 'auto',
	maxHeight: '55vh',

	'&::-webkit-scrollbar': {
		width: '$4'
	},
	'&::-webkit-scrollbar-track': {
		background: 'transparent',
		borderRadius: '$pill'
	},
	'&::-webkit-scrollbar-thumb': {
		background: '$primary200',
		borderRadius: '$pill',

		'&:hover': {
			background: '$primary400'
		}
	}
});

export { CardsContainer };
