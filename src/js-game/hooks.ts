import { useGlobalApi } from './api-tools';
import { AuthType } from './types/global';

export const useWhoami = () => {
  const [data] = useGlobalApi<AuthType>('/api/auth');

  return data?.user;
};
