import mongoose, { Schema } from 'mongoose';

export type DBUser = mongoose.Document & {
  id: string,
  accessToken: string,
  refreshToken: string,
  user_id: string,
  login: string,
  display_name: string,
  image: string,
  user_link: string,
  last_signin: string,
  users: { name: string, time: number }[],
  muteUsers: { name: string, time: number }[],
  premUsers: { name: string }[],
  type: number,
  stats: number,
  volume: string
}

const User = new Schema(
  {
    id: String,
    accessToken: String,
    refreshToken: String,
    user_id: String,
    login: String,
    display_name: String,
    image: String,
    user_link: String,
    last_signin: String,
    users: Array,
    muteUsers: Array,
    premUsers: Array,
    type: Number,
    stats: Number,
    volume: String
  }
)

export const Users = mongoose.model<DBUser>('Users', User);
