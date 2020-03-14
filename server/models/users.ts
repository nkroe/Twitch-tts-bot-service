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
  createdAt: string,
  last_signin: string,
  users: { name: string, time: number }[],
  muteUsers: { name: string, time: number }[],
  premUsers: { name: string }[],
  type: number,
  stats: number,
  volume: string,
  fakeOn: boolean,
  isFollowed: boolean,
  isPayed: boolean,
  payedDate: string,
  payedDateMs: number,
  subscriptionEndDateMs: number,
  isVip: boolean,
  lastPaymentId: number,
  referralCode: string
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
    createdAt: String,
    last_signin: String,
    users: Array,
    muteUsers: Array,
    premUsers: Array,
    type: Number,
    stats: Number,
    volume: String,
    fakeOn: Boolean,
    isFollowed: Boolean,
    isPayed: Boolean,
    payedDate: String,
    payedDateMs: Number,
    subscriptionEndDateMs: Number,
    isVip: Boolean,
    lastPaymentId: Number,
    referralCode: String
  }
)

export const Users = mongoose.model<DBUser>('Users', User);
