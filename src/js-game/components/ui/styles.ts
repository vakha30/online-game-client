import { css } from 'styled-components';

export type BaseStylesProps = {
  width?: string;
  height?: string;
};

export const baseStyles = css<BaseStylesProps>`
  ${({ width }) =>
    width &&
    css`
      width: ${width};
    `};
  ${({ height }) =>
    height &&
    css`
      height: ${height};
    `};
`;
