import mongoose, { Schema } from 'mongoose';

export type DBSettings = mongoose.Document & {
  accessToken: string,
  refreshToken: string,
  secret: string,
  apiKey: string,
  roboPass1: string,
  roboPass2: string,
  paidUsers: string[]
}

const Setting = new Schema(
  {
    accessToken: String,
    refreshToken: String,
    secret: String,
    apiKey: String,
    roboPass1: String,
    roboPass2: String,
    paidUsers: Array
  }
)

export const Settings = mongoose.model<DBSettings>('Settings', Setting);
