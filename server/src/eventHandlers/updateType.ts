import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<{}, { channel: string; type: number; }>;

export const updateTypeHandler: Type = () => async ({ channel, type }) => {
  Users.findOne({ login: channel }).then(user => {
    if (!user) return;

    Users.updateOne({
      login: channel
    }, {
      $set: {
        "type": type
      }
    }).then(() => '')
  })
};
