import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<{}, { channel: string, name: string, time: number }>;

export const muteHandler: Type = () => async ({ channel, name, time }) => {
  await Users.findOne({ login: channel }).then(async user => {
    if (!user) return;

    const muteUser = user.muteUsers.find(elem => elem.name === name);

    if (muteUser) {
      const newMuteUsers = user.muteUsers.map(elem => elem.name === name ? ({ name, time }) : elem);

      await Users.updateOne({
        login: channel,
      }, {
        $set: {
          "muteUsers": newMuteUsers
        }
      }).then(() => '');
    } else {
      await Users.updateOne({
        login: channel,
      }, {
        $push: {
          "muteUsers": { name, time }
        }
      }).then(() => '');
    }
  })
};
