import axios from 'axios';
import { Field } from 'formik';
import { ValidationError } from 'js-game/components';
import { GameFormik } from 'js-game/components/GameFormik';
import { Paper, Stack } from 'js-game/components/ui';
import { useAuth } from 'js-game/providers/authProvider/AuthHook';
import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register: FC = () => {
  const { setAuthToken } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const navigate = useNavigate();

  const userRegister = async (values) => {
    try {
      await axios.post('/api/auth/register', values);

      const { data } = await axios.post('/api/auth/login', {
        login: values.login,
        password: values.password,
      });

      setAuthToken(data.token);
      setLoginError(null);
      navigate('/');
    } catch (error) {
      setLoginError(error.response.data.message);
    }
  };

  const initialValues = {
    name: '',
    login: '',
    password: '',
  };

  return (
    <Paper padding={2}>
      <Stack alignItems="center" spacing={3}>
        <p>Регистрация</p>
        <GameFormik initialValues={initialValues} onSubmit={userRegister} validate={(values) => {}}>
          {({ isSubmitting }) => (
            <>
              <Field name="name" placeholder="Имя" />
              <Field name="login" placeholder="Логин" />
              <Field name="password" placeholder="Пароль" />
              {loginError && <ValidationError errorText={loginError} />}
              <button type="submit">Зарегистрироваться</button>
            </>
          )}
        </GameFormik>
        <p>
          Уже зарегистрированны? Тогда <Link to="/login">войдите</Link>
        </p>
      </Stack>
    </Paper>
  );
};

export default Register;
