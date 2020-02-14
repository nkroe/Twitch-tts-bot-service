import { useState } from 'react';
import Base from '../layouts/Base';
import styled from 'styled-components';
import ModalTermsOfUse from '../components/Modals/ModalTermsOfUse';
import { Button } from '../components/Button/Button';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig()

const Div = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
  color: #ffff;
  font-family: 'Roboto', sans-serif;
  user-select: none;
`;

const ButtonsDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-size: 14px;
  color: #ffff;
  font-family: 'Roboto', sans-serif;
  user-select: none;
`;

const Span = styled.span`
  align-self: center;
  margin-top: 40px;
`;

const TermsOfUse = styled.div`
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

const FollowersError = () => {
  const [showModalTermsOfUse, setShowModalTermsOfUse] = useState(false);

  return (
    <Base>
      <Modal__background style={{ zIndex: showModalTermsOfUse ? 100 : -1, display: showModalTermsOfUse ? 'block' : 'none' }} onClick={() => { setShowModalTermsOfUse(false); }} />
      <Div>
        <ButtonsDiv>
          <Button text={'Подписка на 1 месяц'} onClick={() => {
            location.href = `${publicRuntimeConfig.BACK}/api/payment/1`;
          }} style={{ alignSelf: 'center' }}/>
          <Button text={'Подписка на 3 месяца'} onClick={() => {
            location.href = `${publicRuntimeConfig.BACK}/api/payment/2`;
          }} style={{ alignSelf: 'center' }}/>
          <Button text={'Подписка на 6 месяцев'} onClick={() => {
            location.href = `${publicRuntimeConfig.BACK}/api/payment/3`;
          }} style={{ alignSelf: 'center' }}/>
          <Button text="Назад" onClick={() => {
            location.href = `${publicRuntimeConfig.BACK}`;
          }} />
        </ButtonsDiv>
      </Div>
      <TermsOfUse onClick={() => setShowModalTermsOfUse(true)}>
        ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ
      </TermsOfUse>
      <ModalTermsOfUse show={showModalTermsOfUse} />
    </Base>
  )
}

export default FollowersError;