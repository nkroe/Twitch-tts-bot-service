import styled from 'styled-components';
import { ReactNode } from 'react';

const BaseLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: auto;
  min-height: 100vh;
  position: relative;
  overflow: auto;
  background: #3b2c5e;
`;

type Props = {
  children: ReactNode;
};

const Base = ({ children }: Props) => {
  return <BaseLayout>{children}</BaseLayout>;
};

export default Base;
