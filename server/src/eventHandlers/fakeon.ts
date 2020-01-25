import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<{}, { streamer: string; }>;

export const fakeon: Type = () => async ({ streamer }) => {
  Users.findOne({ login: streamer }).then(user => {
    if (!user) return;

    Users.updateOne({
      login: streamer
    }, {
      $set: {
        "fakeOn": true
      }
    }).then(() => '')
  })
};
