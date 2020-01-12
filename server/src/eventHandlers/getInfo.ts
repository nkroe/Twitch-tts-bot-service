import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<any, string>;

export const getInfoHandler: Type = event => async login => {

  const user = await Users.findOne({ login });

  if (!user) return;

  const mutedUsers = user.muteUsers.filter(mutedUser => mutedUser.time > (Date.now() / 1000));

  const mutedUsersChanged = user.muteUsers.length !== mutedUsers.length;

  if (mutedUsersChanged) {
    setTimeout(async () => {
      try {
        await Users.updateOne({
          login
        }, {
          $set: {
            "muteUsers": mutedUsers
          }
        });
      } catch (e) {
        console.log(e);
      }
    }, 5000);
  }

  event.emit(`getInfoRes-${login}`, {
    chan: login,
    users: user.users,
    muteUsers: mutedUsers,
    premUsers: user.premUsers,
    type: user.type
  });
};
