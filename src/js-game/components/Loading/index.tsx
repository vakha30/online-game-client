import { CircularProgress, Grid, LinearProgress } from '@mui/material';
import { FC } from 'react';

export const Loading: FC = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        height: '100%',
      }}
    >
      <CircularProgress />
    </Grid>
  );
};
