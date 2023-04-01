import { FC, useEffect, useState } from 'react';
import { useAction, useGlobalApi } from 'js-game/api-tools';
import * as actions from './actions';
import axios from 'axios';
import { useAuth } from 'js-game/providers/authProvider/AuthHook';
import { AuthType, UserType } from 'js-game/types/global';
import { Box } from '@mui/material';

const Home: FC = () => {
  const { logout, user } = useAuth();

  return (
    <Box height="100%">
      Home page
      <button onClick={logout}>LOGOUT</button>
      {<h3>{user.name}</h3>}
    </Box>
  );
};

export default Home;
