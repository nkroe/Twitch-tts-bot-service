import mongoose from 'mongoose';

const MONGO = process.env.MONGO;

export const startDb = (): Promise<typeof import("mongoose")> => mongoose.connect(MONGO || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
