import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<{}, { channel: string; type: number; name: string; time: number; }>;

export const updateUsersHandler: Type = () => async ({ channel, type, name, time }) => {
  Users.findOne({ login: channel }).then(user => {
    if (!user) return;

    if (type === 1) {
      const users = user.users.concat({ name, time });

      Users.updateOne({
        login: channel
      }, {
        $set: {
          "users": users
        }
      }).then(() => '');
    } else if (type === 2) {
      const users = user.users.map(elem => elem.name === name ? ({ name: elem.name, time }) : elem);

      Users.updateOne({
        login: channel
      }, {
        $set: {
          "users": users
        }
      }).then(() => '')
    }
  })
};
