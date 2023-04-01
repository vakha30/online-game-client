import axios from 'axios';

export const login = () =>
  axios.post('/api/auth/login', {
    login: 'vakha',
    password: 'stalker95',
  });
