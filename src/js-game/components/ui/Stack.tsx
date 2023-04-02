import { FC, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';
import { SPACING } from './constants';

type Props = PropsWithChildren & {
  spacing?: number;
  direction?: 'row' | 'column';
};

const columnSpacing = css`
  ${({ theme, spacing }) => `
  & > :not(:last-child) {
    margin-bottom: ${theme.spacing(spacing)};
  }
  `}
`;

const rowSpacing = css`
  ${({ theme }) => `
  & > :not(:last-child) {
    margin-right: ${theme.spacing(2)};
  }
  `}
`;

const StackUI = styled.div`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  align-items: flex-start;
  ${({ spacing, direction }) => spacing && (direction === 'row' ? rowSpacing : columnSpacing)}
`;

export const Stack: FC<Props> = ({ children, spacing, direction = 'column' }) => {
  return (
    <StackUI spacing={spacing} direction={direction}>
      {children}
    </StackUI>
  );
};
