import { FC, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

type Props = {
  padding?: number;
};

const PaperUI = styled.div<Props>`
  border-radius: 4px;
  box-shadow: 1px 1px 8px 2px rgba(34, 60, 80, 0.2);;
  ${({ theme, padding }) =>
    padding &&
    css`
      padding: ${theme.spacing(padding)};
    `}
`;

export const Paper: FC<PropsWithChildren<Props>> = ({ children, padding }) => {
  return <PaperUI padding={padding}>{children}</PaperUI>;
};
