
import React, { useState } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig()

function getCookie(name: any) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

const Modal__main = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500&display=swap');
  width: 600px;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  left: calc(50% - 300px);
  top: calc(50% - 200px);
  background: #3b2c5e;
  word-wrap: none;
  padding: 15px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.7;
  font-family: 'Roboto', sans-serif;
  color: #ccc;
  border-radius: 5px;
`

const ButtonBlock = styled.div`
  align-self: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: 240px;
  height: 60px;
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
`

const Input = styled.input`
  align-self: center;
  width: 240px;
  height: 25px;
  margin: 10px;
  padding-left: 5px;
  background: #4b367c;
  border: 1px solid #282235;
  color: #fff;
  outline: none;
  user-select: none;
`

const Span = styled.span`
  align-self: center;
  margin-bottom: 10px;
  font-size: 13.5px;
  text-align: center;
  user-select: none;
`

const SpanSpoiler = styled.span`
  align-self: center;
  margin-top: 20px;
  font-size: 12.5px;
  text-align: center;
  user-select: none;
  opacity: 0.4;
`

const ModalSettings = ({ show }: any) => {
  const [inputValue, setInputValue] = useState('');

  const socket = io(publicRuntimeConfig.BACK);

  const checkVolume = (a: string) => a.match(/^-?([0-9]){0,2}(\.([0-9]){1})?$/gi)

  const sendData = () => {
    const streamer = getCookie('accessToken')
    if (checkVolume(inputValue)) {
      socket.emit('setVolume', ({ streamer, volume: Number(inputValue) }))
      setInputValue('');
    } else {
      alert('Bad volume')
    }
  }

  const testVolume = () => {
    const streamer = getCookie('accessToken')
    socket.emit('testVolume', ({ streamer }))
  }

  return (
    <Modal__main style={{ zIndex: show ? 100 : -1, display: show ? 'flex' : 'none' }}>
      <Span>
        Введите значение от -96.0 до 16.0 (оптимальные значения от -6 до 6)
      </Span>
      <Input onChange={e => setInputValue(e.target.value)} value={inputValue} type="text" placeholder="Значение громкости" />
      <ButtonBlock onClick={() => { sendData() }}>
        Сохранить
      </ButtonBlock>
      <ButtonBlock onClick={() => { testVolume() }}>
        Тест
      </ButtonBlock>
      <SpanSpoiler>
        Для теста необходимо открыть свою ссылку, либо добавить её в ОБС
      </SpanSpoiler>
    </Modal__main>
  );
}

export default ModalSettings;