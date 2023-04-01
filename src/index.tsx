import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { getTheme } from 'js-game/theme';
import { AuthProvider } from 'js-game/providers/authProvider/AuthProvider';
import RootRouting from './root/RootRouting';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <BrowserRouter>
    <ThemeProvider theme={getTheme()}>
      <AuthProvider>
        <CssBaseline />
        <RootRouting />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
