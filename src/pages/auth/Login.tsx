import axios from 'axios';
import { Field } from 'formik';
import { ValidationError } from 'js-game/components';
import { GameFormik } from 'js-game/components/GameFormik';
import { Button, Paper, Stack } from 'js-game/components/ui';
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
      <Paper padding={2}>
        <Stack alignItems="center">
          <p>Вход</p>
          <GameFormik initialValues={initialValues} onSubmit={userLogin} validate={(values) => {}}>
            {({ isSubmitting }) => (
              <>
                <Field name="login" placeholder="Логин" />
                <Field name="password" placeholder="Пароль" />
                {loginError && <ValidationError errorText={loginError} />}
                <Button variant="contained">Войти</Button>
              </>
            )}
          </GameFormik>
          <p>
            Создать аккаунт можно на странице <Link to="/register">регистрации</Link>
          </p>
        </Stack>
      </Paper>
    </div>
  );
};

export default Login;
