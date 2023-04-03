import { FC, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

type Props = {
  variant?: 'outlined' | 'contained' | 'none';
  color?: 'primary' | 'secondary';
};

const outlinedVariant = css`
  border: 1px solid #ff0000;
`;

const containedVariant = css`
  background-color: #ff0000;
`;

const ButtonUI = styled.button<Props>`
  border-radius: ${({ theme }) => theme.spacing(1)};
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
    ${({ variant }) =>
      variant !== 'none' && (variant === 'outlined' ? outlinedVariant : containedVariant)};
`;

export const Button: FC<PropsWithChildren<Props>> = ({ children, variant = 'outlined' }) => {
  return <ButtonUI variant={variant}>{children}</ButtonUI>;
};
