import { FC, lazy } from 'react';
import { Button, Checkbox, Typography, useTheme } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'js-game/providers/authProvider/AuthHook';
import { useGlobalApi } from 'js-game/api-tools';
import { AuthType } from 'js-game/types/global';

const Home = lazy(() => import('../pages/home'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

const RootRouting: FC = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={token ? <Home /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default RootRouting;
