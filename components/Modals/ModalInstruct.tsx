
import styled from 'styled-components';

const Modal__main = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500&display=swap');
  width: 800px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  text-align: left;
  position: absolute;
  left: calc(50% - 400px);
  top: calc(50% - 400px);
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

const ModalInstruct = ({ show }: any) => {
  return ( 
    <Modal__main style = {{ zIndex: show ? 100 : -1, display: show ? 'flex' : 'none' }}>
      <p>1. Добавить в OBS новую сцену "Браузер"</p>
      <p>2. В поле "Адрес URL" вставить ссылку, которую получили при клике на кнопку "Получить ссылку" (она будет скопирована в буфер обмена)</p>
      <p>3. Поставить галочку "Обновлять браузер, когда сцена становится активной"</p>
      <p>4. Если бот перестает работать нажать на кнопку в OBS "Обновить кэш текущей страницы" (команда !fakecache), либо сообщить разработчику в ВК - <a href="https://vk.com/nikitakroe" style={{ textDecoration: 'none', color: '#fff' }} target="_blank" >VK</a></p>
      <br/>
      <p>Команды:</p>
      <p><strong>Все команды доступны модерам</strong></p>
      <br/>
      <p>!fakeon/fakeoff - включение/выключение бота</p>
      <p>!fake text - озвучка текста</p>
      <p>!skip - скип текущего сообщения</p>
      <br/>
      <p><strong>Режимы работают только по отдельности, два режима поставить нельзя</strong></p>
      <p>!fakemsg - режим для выделенных сообщений (за баллы канала)</p>
      <p>!fakesub - режим для подписчиков и выше</p>
      <p>!fakevip - режим для вип и выше</p>
      <p>!fakeprem - режим для премиум пользователей (только тех, кого добавили/модеров/стримера)</p>
      <br/>
      <p>!fakemute nick time - заблокировать пользователя для бота на N минут (!fakemute nick 5 - мут пользователя nick на 5 минут)</p>
      <p>!fakeunmute nick - разблокировать пользователя для бота</p>
      <p>!fakesetprem nick - добавить пользователя в премиум режим</p>
      <p>!fakeunprem nick - удалить пользователя из премиум режима</p>
      <p>!fakecache - обновление кэша в сцене (только для стримера, можно сделать бинд для стрим дека, чтобы не заходить в сцену)</p>
      <br/>
      <p><strong>Ограничений в режиме выделенных сообщений нет</strong></p>
      <p>Ограничения для простого режима - сабы/випы/модеры - 250 символов и сообщение раз в 15 секунд</p>
      <br/>
      <p>Если вы заметили баг/недоработку/есть предложения - можете сообщить разработчику в ВК - <a href="https://vk.com/nikitakroe" style={{ textDecoration: 'none', color: '#fff' }} target="_blank">VK</a></p>
      <p><a href="https://www.donationalerts.com/r/fake_fake_fake_" style={{ textDecoration: 'none', color: '#fff' }} target="_blank">Поддержать/отблагодарить - donationalerts</a></p>
    </Modal__main>
   );
}
 
export default ModalInstruct;