import mongoose, { Schema } from 'mongoose';

const Setting = new Schema(
    { 
        accessToken: String, 
        refreshToken: String,
        secret: String,
        apiKey: String
    }
)

export const Settings = mongoose.model('Settings', Setting);
