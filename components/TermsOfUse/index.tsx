import React, { Fragment, Dispatch, SetStateAction } from 'react';
import { ModalTermsOfUse } from './modalTermsOfUse';
import styled from 'styled-components';

const TermsOfUseBlock = styled.div`
  width: 100%;
  position: absolute;
  bottom: 15px;
  left: 0;
  color: #bcabe0;
  font-size: 12px;
  text-align: center;
  justify-content: center;
  user-select: none;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
`;

const ModalBackground = styled.div`
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
  show: boolean;
  onClick: Dispatch<SetStateAction<boolean>>;
};

export const TermsOfUse = ({ show, onClick }: Props) => {
  const onBackgroundClicked = (e: React.MouseEvent) => {
    e.preventDefault();

    if (e.target !== e.currentTarget) return;

    onClick(false);
  };

  return (
    <Fragment>
      <ModalBackground
        style={{ zIndex: show ? 100 : -1, display: show ? 'block' : 'none' }}
        onClick={onBackgroundClicked}
      >
        <ModalTermsOfUse show={show} />
      </ModalBackground>
      <TermsOfUseBlock onClick={() => onClick(true)}>ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ</TermsOfUseBlock>
    </Fragment>
  );
};
