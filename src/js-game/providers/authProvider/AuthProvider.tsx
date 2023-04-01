import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { LS_TOKEN_KEY } from './constants';
import { AuthType, UserType } from 'js-game/types/global';
import { Loading } from 'js-game/components';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN_KEY));
  const [user, setUser] = useState<UserType>();

  const setAuthToken = useCallback((newToken) => {
    setToken(() => {
      if (newToken) {
        axios.defaults.headers.authorization = `Bearer ${newToken}`;
        localStorage.setItem(LS_TOKEN_KEY, newToken);
      } else {
        axios.defaults.headers.authorization = ``;
        localStorage.removeItem(LS_TOKEN_KEY);
      }

      return newToken;
    });
  }, []);

  const logout = useCallback(() => {
    setAuthToken('');
  }, [setAuthToken]);

  useEffect(() => {
    axios.defaults.headers.authorization = `Bearer ${token}`;
  }, [token]);

  // перехватчик axios на случай, если слетит авторизация
  useEffect(() => {
    axios.interceptors.response.use(null, (error) => {
      if (error.response?.status === 401) {
        setToken(null);
      }

      return Promise.reject(error);
    });
  }, [setToken]);

  // Получение пользователя
  const fetchUser = async () => {
    try {
      const { data } = await axios<AuthType>('/api/auth', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data.user);
    } catch (error) {
      setUser(undefined);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  if (token && user === undefined) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ user, token, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
