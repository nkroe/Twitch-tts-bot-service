import App from 'next/app';
import React from 'react';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';

export default class MyApp extends App {
  //@ts-ignore
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </>
    );
  }
}
