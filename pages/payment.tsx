import { useState } from 'react';
import Base from '../layouts/Base';
import styled from 'styled-components';
import { Button } from '../components/Button/Button';
import getConfig from 'next/config';
import { TermsOfUse } from '../components/TermsOfUse';

const { publicRuntimeConfig } = getConfig();

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

const FollowersError = () => {
  const [showModalTermsOfUse, setShowModalTermsOfUse] = useState(false);

  return (
    <Base>
      <Div>
        <ButtonsDiv>
          <Button
            text={'Подписка на 1 месяц'}
            onClick={() => {
              window.location.href = `${publicRuntimeConfig.BACK}/api/payment/1`;
            }}
            style={{ alignSelf: 'center' }}
          />
          <Button
            text={'Подписка на 3 месяца'}
            onClick={() => {
              window.location.href = `${publicRuntimeConfig.BACK}/api/payment/2`;
            }}
            style={{ alignSelf: 'center' }}
          />
          <Button
            text={'Подписка на 6 месяцев'}
            onClick={() => {
              window.location.href = `${publicRuntimeConfig.BACK}/api/payment/3`;
            }}
            style={{ alignSelf: 'center' }}
          />
          <Button
            text="Назад"
            onClick={() => {
              window.location.href = `${publicRuntimeConfig.BACK}`;
            }}
          />
        </ButtonsDiv>
      </Div>
      <TermsOfUse show={showModalTermsOfUse} onClick={setShowModalTermsOfUse} />
    </Base>
  );
};

export default FollowersError;
