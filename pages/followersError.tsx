import Base from '../layouts/Base';
import styled from 'styled-components';

const Span = styled.span`
  font-size: 14px;
  color: #ffff;
  font-family: 'Roboto', sans-serif;
  user-select: none;
`;

const FollowersError = () =>
  <Base>
    <Span>
      Твое количество фолловеров должно быть больше 2000, приходи позже :)
    </Span>
  </Base>

export default FollowersError;