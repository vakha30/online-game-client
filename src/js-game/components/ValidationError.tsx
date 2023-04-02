import { FC } from 'react';

export const ValidationError: FC<{ errorText: string }> = ({ errorText }) => {
  return <p>{errorText}</p>;
};
