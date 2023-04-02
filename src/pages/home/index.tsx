import { FC } from 'react';
import { useAuth } from 'js-game/providers/authProvider/AuthHook';
import { NavLink } from 'react-router-dom';
import { Loading } from 'js-game/components';
import { useWhoami } from 'js-game/hooks';
import { useGlobalApi } from 'js-game/api-tools';
import { CreateCity } from '../../root/CreateCity';

const Home: FC = () => {
  const { logout } = useAuth();
  const whoami = useWhoami();
  const [data] = useGlobalApi<{ city: { name: string } }>('/api/city');

  if (whoami === undefined || data === undefined) {
    return <Loading />;
  }

  const { city } = data;

  if (!city) {
    return <CreateCity />;
  }

  return (
    <div>
      Home page
      {<h3>{whoami.name}</h3>}
      {<h3>{city.name}</h3>}
    </div>
  );
};

export default Home;
