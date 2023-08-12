import { FC, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';
import { BaseStylesProps, baseStyles } from './styles';

type Props = PropsWithChildren &
  BaseStylesProps & {
    spacing?: number;
    direction?: 'row' | 'column';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
    alignItems?: 'flex-start' | 'center' | 'flex-end';
  };

const columnSpacing = css<Props>`
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

const StackUI = styled.div<Props>`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  justify-content: ${({ justifyContent }) => justifyContent};
  align-items: ${({ alignItems }) => alignItems};
  ${({ spacing, direction }) => spacing && (direction === 'row' ? rowSpacing : columnSpacing)}

  ${baseStyles}
`;

export const Stack: FC<Props> = ({
  children,
  spacing,
  direction = 'column',
  justifyContent = 'flex-start',
  alignItems = 'flex-start',
  width,
  height,
}) => {
  return (
    <StackUI
      spacing={spacing}
      direction={direction}
      justifyContent={justifyContent}
      alignItems={alignItems}
      width={width}
      height={height}
    >
      {children}
    </StackUI>
  );
};
