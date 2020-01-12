import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<{}, { channel: string; name: string; }>;

export const unpremHandler: Type = () => async ({ channel, name }) => {
  Users.findOne({ login: channel }).then(user => {
    if (!user) return;

    const premUsers = user.premUsers.filter(w => w.name !== name);

    Users.updateOne({
      login: channel
    }, {
      $set: {
        "premUsers": premUsers
      }
    }).then(() => '')
  })
};
