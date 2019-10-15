import { useEffect, useState } from 'react';
import cookies from 'next-cookies';
import axios from 'axios';
import styled from 'styled-components';

import Button from '../components/Button/Button';

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

const Base = props => {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setLoading(true);
        }, 100)
    }, [])
    return (
        <BaseLayout>
            <ContentBlock>
                { loading ? (
                    <>
                        <Button user={ props.user.user_link } text={ props.user.display_name  ? ('Добавить бота для канала') : 'Войти с помощью Twitch' } type={ props.user.display_name ? 1 : 2 } />
                        { props.user.display_name ? ( <Button text="Инструкция" type={4} /> ) : ''}
                        { props.user.display_name ? ( <Button text="Выйти" type={3} /> ) : ''}
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