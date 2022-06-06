/* eslint-disable react/no-unstable-nested-components */
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from 'react-query';

import Button from 'components/Primitives/Button';
import Flex from 'components/Primitives/Flex';
import Text from 'components/Primitives/Text';

const QueryError: React.FC = ({ children }) => {
	return (
		<QueryErrorResetBoundary>
			{({ reset }) => (
				<ErrorBoundary
					onReset={reset}
					fallbackRender={({ resetErrorBoundary }) => (
						<Flex css={{ my: '$24' }} direction="column" gap="12">
							<Text color="dangerBase">There was an error fetching the data! </Text>
							<Button onClick={resetErrorBoundary}>Try again</Button>
						</Flex>
					)}
				>
					{children}
				</ErrorBoundary>
			)}
		</QueryErrorResetBoundary>
	);
};

export default QueryError;
