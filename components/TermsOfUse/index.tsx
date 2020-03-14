import React, { Fragment } from 'react';
import ModalTermsOfUse from '../Modals/ModalTermsOfUse';
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

const Modal__background = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  background: rgba(0,0,0, 0.5);
  z-index: -1;
  cursor: pointer;
`;

export const TermsOfUse = ({ show, onClick }: { show: boolean; onClick: any }) => {
  return (
    <Fragment>
      <Modal__background style={{ zIndex: show ? 100 : -1, display: show ? 'block' : 'none' }} onClick={() => { onClick(false); }} />
      <TermsOfUseBlock onClick={() => onClick(true)}>
        ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ
      </TermsOfUseBlock>
      <ModalTermsOfUse show={show} />
    </Fragment>
  );
}
