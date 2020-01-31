
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
  top: calc(50% - 350px);
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

const ModalTermsOfUse = ({ show }: any) => {
  return ( 
    <Modal__main style = {{ zIndex: show ? 100 : -1, display: show ? 'flex' : 'none' }}>
      <p><strong>Описание услуги</strong></p>
      <p>Fakebot позволяет "озвучивать" сообщения, которые пишут зрители подключаемого канала.</p>
      <p>В боте на данный момент реализованы такие функции, как:</p>
      <p>&nbsp; - озвучка выделенных сообщений (за баллы канала).</p>
      <p>&nbsp; - озвучка обычных сообщений.</p>
      <p>&nbsp; - возможность пропустить сообщение.</p>
      <p>&nbsp; - замьютить зрителя для бота и все его сообщения будут игнорироваться.</p>
      <p>&nbsp; - размьютить зрителя.</p>
      <p>&nbsp; - режимы для премиум пользователей, подписчиков (в дальнейшем может быть удален), випов, выделенных сообщений.</p>
      <p>&nbsp; - включение/отключение бота.</p>
      <br/>
      <p><strong>Условия приобретения</strong></p>
      <p>В данный момент активно ведется разработка и бот находится в бета-тестировании, в дальнейшем цена может измениться.</p>
      <p>Приобретая данную услугу Вы получаете все описанные ранее функции.</p>
      <p>В дальнейшем будет разработана реферальная система и за каждого приглашенного пользователя будут бонусы :)</p>
      <br/>
      <p><strong>Условия возврата</strong></p>
      <p>Полный возврат денежных средств возможен в течение 3х дней, после покупки, при условие, что ранее бот не приобретался для данного канала.</p>
      <br/>
      <p><strong>Контактная информация</strong></p>
      <p>По всем вопросам и предложениям - nikitakfast1@mail.ru</p>
      <p>Разработка индивидуальных ботов - <a href="https://vk.com/nikitakroe" style={{ textDecoration: 'none', color: '#fff' }} target="_blank">vk.com/nikitakroe</a></p>
    </Modal__main>
   );
}
 
export default ModalTermsOfUse;