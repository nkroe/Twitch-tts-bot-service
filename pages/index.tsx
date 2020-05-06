import { useEffect, useState } from 'react';
import Base from '../layouts/Base';
import getConfig from 'next/config';
import axios from 'axios';
import styled from 'styled-components';
import Button from '../components/Button/Button';
import ModalInstruct from '../components/Modals/modalInstruct';
import ModalSettings from '../components/Modals/modalSettings';
import TermsOfUse from '../components/TermsOfUse';
//@ts-ignore
import { NotifyComponent, NotifyHandler } from 'react-notification-component';
import copy from 'copy-to-clipboard';
import { getCookie } from '../server/lib/getCookie';

const { publicRuntimeConfig } = getConfig();

const Loading = styled.div`
  width: auto;
  height: auto;
  color: #fff;
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  letter-spacing: 1.1px;
  user-select: none;
  align-self: center;
`;

const ButtonBlock = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: 240px;
  height: 60px;
  min-width: 240px;
  min-height: 60px;
  background: #4b367c;
  color: #fff;
  user-select: none;
  margin: 10px;
  transition: 0.2s;
  box-shadow: 3px 3px 0 3px #282235;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;

  &:hover {
    box-shadow: 1px 1px 0 1px #282235;
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
`;

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState({
    user_id: 0,
    user_link: '',
    display_name: '',
    isPayed: false,
    isVip: false,
  });
  const [showModalInstruct, setModalInstruct] = useState(false);
  const [showModalSettings, setModalSettings] = useState(false);
  const [showModalTermsOfUse, setShowModalTermsOfUse] = useState(false);

  useEffect(() => {
    const accessToken = getCookie('accessToken');

    if (!accessToken) {
      setLoading(false);
      return;
    }

    axios.get(`${publicRuntimeConfig.BACK}/api/getUser/${accessToken}`).then(data => {
      setLoading(false);
      setUserState(data.data);
    });
  }, []);

  const goToAuth = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const r = urlParams.get('r');

    window.location.href = `${window.location.origin}/api/auth/twitch${r ? `?r=${r}` : ''}`;
  };

  const copyLink = (link: string) => {
    copy(link);
    NotifyHandler.add(
      'Скопировано',
      '',
      {},
      {
        mainBackground: '#4b367c',
        mainBackgroundHover: '#4f3a81',
        styleProgress: { background: '#634a9c' },
      }
    );
    copy(link);
  };

  return (
    <Base>
      <ModalInstruct
        style={{
          zIndex: showModalInstruct ? 100 : -1,
          display: showModalInstruct ? 'block' : 'none',
        }}
        onClick={() => {
          setModalInstruct(false);
          setModalSettings(false);
        }}
      />
      <ModalSettings
        style={{
          zIndex: showModalSettings ? 100 : -1,
          display: showModalSettings ? 'flex' : 'none',
        }}
        onClick={() => {
          setModalInstruct(false);
          setModalSettings(false);
        }}
      />
      {!loading ? (
        <Buttons>
          {!userState.display_name && <Button text={'Войти с помощью Twitch'} onClick={goToAuth} />}
          {userState.display_name && (userState.isPayed || userState.isVip) && (
            <Button
              text={'Получить ссылку'}
              onClick={() => copyLink(`${window.location.origin}/${userState.user_link}`)}
            />
          )}
          {userState.display_name && (userState.isPayed || userState.isVip) && (
            <ButtonBlock
              onClick={() => {
                setModalSettings(true);
              }}
            >
              {' '}
              Настройки{' '}
            </ButtonBlock>
          )}
          {userState.display_name && (userState.isPayed || userState.isVip) && (
            <ButtonBlock
              onClick={() => {
                setModalInstruct(true);
              }}
            >
              {' '}
              Инструкция{' '}
            </ButtonBlock>
          )}
          {userState.display_name && !userState.isPayed && !userState.isVip && (
            <Button
              text={'Приобрести подписку'}
              onClick={() => {
                window.location.href = `${publicRuntimeConfig.BACK}/payment`;
              }}
            />
          )}
          {userState.display_name && (
            <Button
              text={'Реферальная ссылка'}
              onClick={() => copyLink(`${window.location.origin}/?r=${userState.user_id}`)}
            />
          )}
          {userState.display_name && (
            <Button
              text="Выйти"
              onClick={() => {
                window.location.href = `${publicRuntimeConfig.BACK}/api/logout`;
              }}
            />
          )}
        </Buttons>
      ) : (
        <Loading>Loading</Loading>
      )}
      <NotifyComponent />
      <TermsOfUse show={showModalTermsOfUse} onClick={setShowModalTermsOfUse} />
    </Base>
  );
};

export default Index;
