import mongoose, { Schema } from 'mongoose';

export type DBSettings = mongoose.Document & {
  accessToken: string,
  refreshToken: string,
  secret: string,
  apiKey: string,
  paidUsers: string[]
}

const Setting = new Schema(
  {
    accessToken: String,
    refreshToken: String,
    secret: String,
    apiKey: String,
    paidUsers: Array
  }
)

export const Settings = mongoose.model<DBSettings>('Settings', Setting);
