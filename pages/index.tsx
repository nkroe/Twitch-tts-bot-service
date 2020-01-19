import { useEffect, useState } from 'react';
import Base from '../layouts/Base';
import getConfig from 'next/config';
import axios from 'axios';
import styled from 'styled-components';
import Button from '../components/Button/Button';
import ModalInstruct from '../components/Modals/ModalInstruct';
import ModalSettings from '../components/Modals/ModalSettings';
//@ts-ignore
import { NotifyComponent } from 'react-notification-component';

const { publicRuntimeConfig } = getConfig()

const Loading = styled.div`
    width: auto;
    height: auto;
    color: #fff;
    font-size: 18px;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 1.1px;
    user-select: none;
`

const ButtonBlock = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    width: 240px;
    height: 60px;
    background: #4b367c;
    color: #fff;
    user-select: none;
    margin-left: 10px;
    margin-right: 10px; 
    transition: 0.2s;
    box-shadow: 3px 3px 0 3px #282235;
    font-size: 14px;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;

    &:hover {
        box-shadow: 1px 1px 0 1px #282235;
    }
`

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
`

function getCookie(name: string) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState({ user_link: '', display_name: '' });
  const [showModalInstruct, setModalInstruct] = useState(false);
  const [showModalSettings, setModalSettings] = useState(false);


  useEffect(() => {
    const accessToken = getCookie('accessToken');

    if (!accessToken) {
      setLoading(false);
      return;
    }

    axios.get(`${publicRuntimeConfig.BACK}/api/getUser/${accessToken}`).then(data => {
      setLoading(false);
      setUserState(data.data);
    })
  }, [])

  return (
    <Base>
      <Modal__background style={{ zIndex: showModalInstruct || showModalSettings ? 100 : -1, display: showModalInstruct || showModalSettings ? 'block' : 'none' }} onClick={() => { setModalInstruct(false); setModalSettings(false); }} />
      <ModalInstruct show={showModalInstruct} />
      <ModalSettings show={showModalSettings} />
      {!loading ? (
        <>
          <Button user={userState.user_link} text={userState.display_name ? ('Получить ссылку') : 'Войти с помощью Twitch'} type={userState.display_name ? 1 : 2} />
          {userState.display_name ? (<ButtonBlock onClick={() => { setModalSettings(true) }} > Настройки </ButtonBlock>) : ''}
          {userState.display_name ? (<ButtonBlock onClick={() => { setModalInstruct(true) }} > Инструкция </ButtonBlock>) : ''}
          {userState.display_name ? (<Button text="Выйти" type={3} />) : ''}
        </>
      ) : (
          <Loading>Loading</Loading>
        )}
        <NotifyComponent />
    </Base>
  )
}

export default Index;