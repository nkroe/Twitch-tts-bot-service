import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<{}, { channel: string; name: string; }>;

export const unmuteHandler: Type = () => async ({ channel, name }) => {
  Users.findOne({ login: channel }).then(user => {
    if (!user) return;

    const muteUsers = user.muteUsers.filter(w => w.name !== name);

    Users.updateOne({
      login: channel
    }, {
      $set: {
        "muteUsers": muteUsers
      }
    }).then(() => '')
  })
};
