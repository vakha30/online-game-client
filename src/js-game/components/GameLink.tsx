import { FC, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

export const GameLink: FC<PropsWithChildren & { to: string }> = ({ children, to, ...props }) => {
  return (
    <Link to={to} {...props}>
      {children}
    </Link>
  );
};
