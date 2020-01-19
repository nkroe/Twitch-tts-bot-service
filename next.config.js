const { parsed: localEnv } = require('dotenv').config()
const webpack = require('webpack')

module.exports = {
  devIndicators: {
    autoPrerender: false,
  },
  publicRuntimeConfig: {
    BACK: process.env.BACK
  },
  webpack: function (c) {
    if (c.resolve.alias) {
      delete c.resolve.alias['react']
      delete c.resolve.alias['react-dom']
    }
    return c
  }, 
  webpack(config) {
    config.plugins.push(new webpack.EnvironmentPlugin(localEnv))

    return config
  }
}