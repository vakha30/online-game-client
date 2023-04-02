import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from 'js-game/providers/authProvider/AuthProvider';
import RootRouting from './root/RootRouting';
import { Suspense } from 'react';
import { Loading } from 'js-game/components';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const theme = {
  spacing: (value: number) => {
    switch (value) {
      case 1:
        return '8px';
        break;
      case 2:
        return '16px';
        break;
      case 3:
        return '24px';
        break;
      case 4:
        return '32px';
        break;
      case 5:
        return '40px';
        break;
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
          <RootRouting />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
