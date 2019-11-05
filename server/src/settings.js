const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const Setting = new Schema(
    { 
        accessToken: String, 
        refreshToken: String,
        secret: String
    }
)

const Settings = mongoose.model('Settings', Setting);

module.exports = {
  Settings
};