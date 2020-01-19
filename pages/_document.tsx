import Document, { Head, Main, NextScript } from 'next/document';

import { ServerStyleSheet } from 'styled-components';

const globalStyle = {
    __html: `
    @import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');
    * {
        margin: 0;
        padding: 0;
    }
`
};

interface CustomInputProps {
  styleTags: string;
}


export default class MyDocument extends Document<CustomInputProps> {
  //@ts-ignore
  static getInitialProps({ renderPage }) {
    const sheet = new ServerStyleSheet();

    const page = renderPage((App: any) => (props: any) =>
      sheet.collectStyles(<App {...props} />),
    );

    const styleTags = sheet.getStyleElement();

    return { ...page, styleTags };
  }

  render() {
    return (
      <html>
        <Head>
            <link rel="shortcut icon" href="/static/favicon.ico" />
            <style dangerouslySetInnerHTML={globalStyle} />
            {this.props.styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}