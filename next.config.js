const { parsed: localEnv } = require('dotenv').config()
const webpack = require('webpack')

module.exports = {
  devIndicators: {
    autoPrerender: false,
  },
  publicRuntimeConfig: {
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_SECRET: process.env.TWITCH_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,

    BACK: process.env.BACK,
    FRONT: process.env.FRONT,
    MONGO: process.env.MONGO,

    USERNAME: process.env.USERNAME,
    PASSWORD: process.env.PASSWORD,
    CHANNEL: process.env.CHANNEL
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