import mongoose, { Schema } from 'mongoose';

type DBSettings = mongoose.Document & {
  accessToken: string,
  refreshToken: string,
  secret: string,
  apiKey: string
}

const Setting = new Schema(
  {
    accessToken: String,
    refreshToken: String,
    secret: String,
    apiKey: String
  }
)

export const Settings = mongoose.model<DBSettings>('Settings', Setting);
