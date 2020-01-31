import { useState } from 'react';
import Base from '../layouts/Base';
import styled from 'styled-components';
import ModalTermsOfUse from '../components/Modals/ModalTermsOfUse';

const Div = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
  color: #ffff;
  font-family: 'Roboto', sans-serif;
  user-select: none;
`;

const TermsOfUse = styled.div`
  width: 100%;
  position: absolute;
  bottom: 15px;
  left: 0;
  color: #675d7d;
  font-size: 10.5px;
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
        <span style={{ alignSelf: 'center', margin: '4px' }}>Твое количество фолловеров должно быть больше 5000</span>
        <span style={{ alignSelf: 'center', margin: '4px' }}>Для получения платного доступа (200 руб.) напиши разработчику в</span>
        <a href="https://vk.com/nikitakroe" style={{ textDecoration: 'none', color: '#fff', fontSize: '22px', alignSelf: 'center', margin: '4px' }} target="_blank">VK</a>
      </Div>
      <TermsOfUse onClick={() => setShowModalTermsOfUse(true)}>
        ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ
      </TermsOfUse>
      <ModalTermsOfUse show={showModalTermsOfUse} />
    </Base>
  )
}

export default FollowersError;