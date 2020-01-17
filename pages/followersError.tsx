import Base from '../layouts/Base';
import styled from 'styled-components';

const Div = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
  color: #ffff;
  font-family: 'Roboto', sans-serif;
  user-select: none;
`;

const FollowersError = () =>
  <Base>
    <Div>
      <span style={{ alignSelf: 'center', margin: '4px' }}>Твое количество фолловеров должно быть больше 5000</span>
      <span style={{ alignSelf: 'center', margin: '4px' }}>Для получения платного доступа (200 руб.) напиши разработчику в</span>
      <a href="https://vk.com/nikitakroe" style={{ textDecoration: 'none', color: '#fff', fontSize: '22px', alignSelf: 'center', margin: '4px' }} target="_blank">VK</a>
    </Div>
  </Base>

export default FollowersError;