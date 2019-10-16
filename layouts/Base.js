import { useEffect, useState } from 'react';
import getConfig from 'next/config';
import cookies from 'next-cookies';
import axios from 'axios';
import styled from 'styled-components';

import Button from '../components/Button/Button';

const { publicRuntimeConfig } = getConfig()

const BaseLayout = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background: #3b2c5e;
    overflow: hidden;
`

const ContentBlock = styled.div`
    align-self: center;
    display: flex;
    justify-content: center;
    flex-direction: row;
    width: fit-content;
    height: 80px;
`

const Loading = styled.div`
    width: auto;
    height: auto;
    color: #fff;
    font-size: 18px;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 1.1px;
    user-select: none;
`

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

const Base = props => {
    const [userState, setUserState] = useState(0);
    
    useEffect(() => {
        const accessToken = getCookie('accessToken');
        axios.get(`${publicRuntimeConfig.BACK}/api/getUser/${accessToken}`).then(data => {
            setUserState(data.data)
        })
    }, [])
    return (
        <BaseLayout>
            <ContentBlock>
                { userState !== 0 ? (
                    <>
                        <Button user={ userState.user_link } text={ userState.display_name  ? ('Добавить бота для канала') : 'Войти с помощью Twitch' } type={ userState.display_name ? 1 : 2 } />
                        { userState.display_name ? ( <Button text="Инструкция" type={4} /> ) : ''}
                        { userState.display_name ? ( <Button text="Выйти" type={3} /> ) : ''}
                    </>
                ) : (
                    <Loading>
                        Loading
                    </Loading>
                )}
                { props.children }
            </ContentBlock>
        </BaseLayout>
    )
}

export default Base;