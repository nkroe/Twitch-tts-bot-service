import styled from 'styled-components';

const ButtonBlock = styled.a`
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
  text-decoration: none;

  &:hover {
      box-shadow: 1px 1px 0 1px #282235;
  }
`

export const ButtonLink = ({ text, onClick, link, style }: { text: string; onClick?: any; link?: string; style?: any }) =>
  <ButtonBlock href={link} onClick={onClick} style={style} target="_blank">
    {text}
  </ButtonBlock>
