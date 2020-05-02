import React, { ReactNode, MouseEvent } from 'react';
import styled from 'styled-components';

const ModalBackgroundBlock = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  overflow: auto;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
  cursor: pointer;
`;

type Props = {
  onClick: (show?: boolean) => void;
  style: { zIndex: number; display: string };
  children: ReactNode;
};

export const ModalBackground = ({ onClick, style, children }: Props) => {
  const onBackgroundClicked = (e: MouseEvent) => {
    e.preventDefault();

    if (e.target !== e.currentTarget) return;

    onClick(false);
  };

  return (
    <ModalBackgroundBlock style={style} onClick={onBackgroundClicked}>
      {children}
    </ModalBackgroundBlock>
  );
};
