import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    -webkit-app-region: drag;
    padding: 0;
    margin: 0;
  }
  button, select, input, p, a {
    -webkit-app-region: none;
  }
`;
