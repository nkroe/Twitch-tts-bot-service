import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<{}, { channel: string; name: string }>;

export const setpremHandler: Type = () => async ({ channel, name }) => {
  Users.findOne({ login: channel }).then(user => {
    if (!user) return;

    const premUsers = user.premUsers.concat({ name });

    Users.updateOne({
      login: channel
    }, {
      $set: {
        "premUsers": premUsers
      }
    }).then(() => '')
  })
};
