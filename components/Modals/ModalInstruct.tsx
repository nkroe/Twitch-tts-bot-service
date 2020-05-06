import styled from 'styled-components';
import { ModalBackground } from './modalBackground';

const ModalMain = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500&display=swap');
  width: 800px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  text-align: left;
  position: absolute;
  left: calc(50% - 400px);
  top: 20px;
  background: #3b2c5e;
  word-wrap: none;
  padding: 15px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.7;
  font-family: 'Roboto', sans-serif;
  color: #ccc;
  border-radius: 5px;
  cursor: auto;

  @media only screen and (max-width: 767px) {
    width: auto;
    left: 0;
    top: 0;
    margin: 20px;
  }
`;

type Props = {
  onClick: () => void;
  style: { zIndex: number; display: string };
};

const ModalInstruct = ({ onClick, style }: Props) => {
  return (
    <ModalBackground onClick={onClick} style={style}>
      <ModalMain className="modal" style={style}>
        <p>
          <strong>Для активации бота необходимо приобрести подписку</strong>
        </p>
        <br />
        <p>1. Добавить в OBS новую сцену "Браузер"</p>
        <p>
          2. В поле "Адрес URL" вставить ссылку, которую получили при клике на кнопку "Получить ссылку" (она будет
          скопирована в буфер обмена)
        </p>
        <p>3. Поставить галочку "Обновлять браузер, когда сцена становится активной"</p>
        <p>
          4. Если бот перестает работать нажать на кнопку в OBS "Обновить кэш текущей страницы" (команда !fakecache),
          либо сообщить разработчику в ВК -{' '}
          <a
            href="https://vk.com/nkroe"
            style={{ textDecoration: 'none', color: '#fff' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            VK
          </a>
        </p>
        <br />
        <p>Команды:</p>
        <p>
          <strong>Все команды доступны модерам</strong>
        </p>
        <br />
        <p>!fakeon/fakeoff - включение/выключение бота</p>
        <p>!fake text - озвучка текста</p>
        <p>!skip - скип текущего сообщения</p>
        <br />
        <p>
          <strong>Режимы работают только по отдельности, два режима поставить нельзя</strong>
        </p>
        <p>!fakemsg - режим для выделенных сообщений (за баллы канала)</p>
        <p>!fakesub - режим для подписчиков и выше</p>
        <p>!fakevip - режим для вип и выше</p>
        <p>!fakeprem - режим для премиум пользователей (только тех, кого добавили/модеров/стримера)</p>
        <br />
        <p>
          !fakemute nick time - заблокировать пользователя для бота на N минут (!fakemute nick 5 - мут пользователя nick
          на 5 минут)
        </p>
        <p>!fakeunmute nick - разблокировать пользователя для бота</p>
        <p>!fakesetprem nick - добавить пользователя в премиум режим</p>
        <p>!fakeunprem nick - удалить пользователя из премиум режима</p>
        <p>
          !fakecache - обновление кэша в сцене (только для стримера, можно сделать бинд для стрим дека, чтобы не
          заходить в сцену)
        </p>
        <br />
        <p>
          <strong>Ограничений в режиме выделенных сообщений нет</strong>
        </p>
        <p>Ограничения для простого режима - сабы/випы/модеры - 250 символов и сообщение раз в 15 секунд</p>
        <br />
        <p>
          Если вы заметили баг/недоработку/есть предложения - можете сообщить разработчику в ВК -{' '}
          <a
            href="https://vk.com/nkroe"
            style={{ textDecoration: 'none', color: '#fff' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            VK
          </a>
        </p>
        <p>
          <a
            href="https://www.donationalerts.com/r/fake_fake_fake_"
            style={{ textDecoration: 'none', color: '#fff' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Поддержать/отблагодарить - donationalerts
          </a>
        </p>
      </ModalMain>
    </ModalBackground>
  );
};

export default ModalInstruct;
