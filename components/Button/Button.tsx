import styled from 'styled-components';

const ButtonBlock = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: 240px;
  height: 60px;
  min-width: 240px;
  min-height: 60px;
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
`;

export const Button = ({ text, onClick, style }: { text: string; onClick: any; style?: any }) => (
  <ButtonBlock onClick={onClick} style={style}>
    {text}
  </ButtonBlock>
);
