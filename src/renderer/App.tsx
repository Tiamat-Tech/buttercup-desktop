import { themes } from '@buttercup/ui';
import { init as initButtercup } from 'buttercup/web';
import React from 'react';
import { hot } from 'react-hot-loader/root';
import styled, { ThemeProvider } from 'styled-components';
import Workspace from './components/Workspace';
import VaultManager from './services/VaultManager';
import { GlobalStyle } from './styles/global';

try {
  initButtercup();
} catch (err) {}

const AppFrame = styled.div`
  height: 100vh;
  display: flex;
`;

const App = () => {
  return (
    <ThemeProvider theme={themes.dark}>
      <GlobalStyle />
      <AppFrame className="bp3-dark">
        <VaultManager>
          <Workspace />
        </VaultManager>
      </AppFrame>
    </ThemeProvider>
  );
};

export default hot(App);
