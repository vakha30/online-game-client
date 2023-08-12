import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { AuthProvider } from 'js-game/providers/authProvider/AuthProvider';
import RootRouting from './root/RootRouting';
import { Suspense } from 'react';
import { Loading } from 'js-game/components';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { css } from '@emotion/react';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'sans-serif';
  }
`;

const theme = {
  spacing: (value: number) => {
    switch (value) {
      case 1:
        return '4px';
      case 2:
        return '8px';
      case 3:
        return '16px';
      case 4:
        return '24px';
      case 5:
        return '32px';
      default:
        throw new Error('Bad value');
    }
  },
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <GlobalStyle />
          <RootRouting />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
