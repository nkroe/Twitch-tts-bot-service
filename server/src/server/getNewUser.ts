import { Users } from '../../models/users';
import { createUUID } from '../../lib/createUUID';
import { createDate } from '../../lib/createDate';
import { Settings } from '../../models/settings';

const SESSION_SECRET = process.env.SESSION_SECRET;

export const getNewUser = async (profile: any) => {
  const settings = await Settings.findOne({ secret: SESSION_SECRET });

  if (!settings) return;

  const user = new Users({
    accessToken: profile.accessToken,
    refreshToken: profile.refreshToken,
    user_id: profile.data[0].id,
    login: profile.data[0].login,
    display_name: profile.data[0].display_name,
    image: profile.data[0].profile_image_url,
    user_link: createUUID(),
    createdAt: createDate(),
    last_signin: createDate(),
    users: [],
    muteUsers: [],
    premUsers: [],
    type: 4,
    stats: 0,
    isVip: false,
    isPayed: false,
    lastPaymentId: settings.paymentsCount,
  });

  await Settings.updateOne(
    { secret: SESSION_SECRET },
    {
      paymentsCount: settings.paymentsCount + 1,
    }
  );

  return user;
};
