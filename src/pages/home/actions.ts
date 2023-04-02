import axios from 'axios';

export const login = () =>
  axios.post('/api/auth/login', {
    login: 'vakha',
    password: 'stalker95',
  });

export const addUser = () =>
  axios.post('http://localhost:3001/api/auth/register', {
    name: 'Example',
    login: 'example',
    password: 'stalker95',
  });

export const createCity = ({ city }: { city: string }) =>
  axios.post('/api/city/create', { name: city });
