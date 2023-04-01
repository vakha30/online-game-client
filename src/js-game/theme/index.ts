import { createTheme, Theme } from '@mui/material';
import createPalette from '@mui/material/styles/createPalette';
import { getOverrides } from './overrides';

const palette = createPalette({
  primary: {
    main: '#c62828',
  },
});

export const getTheme = (): Theme => {
  return createTheme({
    palette,
    components: getOverrides(),
  });
};
