import axios from 'axios';
import { useAction } from 'js-game/api-tools';
import { useAuth } from 'js-game/providers/authProvider/AuthHook';
import { FC } from 'react';
import * as actions from './actions';

const Login: FC = () => {
  const { login } = useAction(actions);
  const { setAuthToken } = useAuth();

  const userLogin = async () => {
    try {
      const { data } = await axios.post('/api/auth/login', {
        login: 'vakha',
        password: 'stalker95',
      });
      setAuthToken(data.token);
    } catch (error) {
      setAuthToken('');
    }
  };

  return (
    <div>
      Login
      <button onClick={userLogin}>LOGIN</button>
    </div>
  );
};

export default Login;
