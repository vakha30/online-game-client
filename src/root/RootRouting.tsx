import { FC, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'js-game/providers/authProvider/AuthHook';
import { Header } from './Header';
import { Stack } from 'js-game/components/ui';

const Home = lazy(() => import('../pages/home'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

const RootRouting: FC = () => {
  const { token } = useAuth();

  return (
    <Stack>
      <Header />
      <Stack width="100%" height="100%">
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={token ? <Home /> : <Navigate to="/login" replace />} />
        </Routes>
      </Stack>
    </Stack>
  );
};

export default RootRouting;
