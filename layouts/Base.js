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
// 4b367c
// 282235

const ContentBlock = styled.div`
    align-self: center;
    display: flex;
    justify-content: center;
    flex-direction: row;
    width: fit-content;
    height: 80px;
`

const Base = props => {
    return (
        <BaseLayout>
            <ContentBlock>
                <Button user={ props.user.user_link } text={ props.user.display_name  ? ('Добавить бота для канала') : 'Войти с помощью Twitch' } type={ props.user.display_name ? 1 : 2 } />
                { props.user.display_name ? ( <Button text="Инструкция" type={4} /> ) : ''}
                { props.user.display_name ? ( <Button text="Выйти" type={3} /> ) : ''}
                { props.children }
            </ContentBlock>
        </BaseLayout>
    )
}

export default Base;