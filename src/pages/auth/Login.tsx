import axios from 'axios';
import { Field } from 'formik';
import { ValidationError } from 'js-game/components';
import { GameFormik } from 'js-game/components/GameFormik';
import { Stack } from 'js-game/components/ui';
import { useAuth } from 'js-game/providers/authProvider/AuthHook';
import { FC, useState } from 'react';
import { Link } from 'react-router-dom';

const Login: FC = () => {
  const { setAuthToken } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const userLogin = async (values) => {
    try {
      const { data } = await axios.post('/api/auth/login', values);
      setAuthToken(data.token);
      setLoginError(null);
    } catch (error) {
      setAuthToken('');
      setLoginError(error.response.data.message);
    }
  };

  const initialValues = {
    login: '',
    password: '',
  };

  return (
    <div>
      <div>
        <Stack>
          <p>Вход</p>
          <GameFormik initialValues={initialValues} onSubmit={userLogin} validate={(values) => {}}>
            {({ isSubmitting }) => (
              <>
                <Field name="login" placeholder="Логин" />
                <Field name="password" placeholder="Пароль" />
                {loginError && <ValidationError errorText={loginError} />}
                <Stack>
                  <button type="submit">Войти</button>
                </Stack>
              </>
            )}
          </GameFormik>
          <p>
            Создать аккаунт можно на странице <Link to="/register">регистрации</Link>
          </p>
        </Stack>
      </div>
    </div>
  );
};

export default Login;
