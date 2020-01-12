import styled from 'styled-components';

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

const Base = (props: any) => {
  return (
    <BaseLayout>
      <ContentBlock>
        {props.children}
      </ContentBlock>
    </BaseLayout>
  )
}

export default Base;