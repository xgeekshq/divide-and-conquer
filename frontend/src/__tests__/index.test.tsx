import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import { render } from '@testing-library/react';
import Home from '../pages';

const queryClient = new QueryClient();

export const Wrapper: React.FC = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
  serverRuntimeConfig: {},
}));

describe('Landing page', () => {
  it('renders a div', () => {
    render(
      <Wrapper>
        <Home />
      </Wrapper>,
    );
  });
});
