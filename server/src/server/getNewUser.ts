import { Users } from "../../models/users";
import { createUUID } from "../../lib/createUUID";
import { createDate } from "../../lib/createDate";

export const getNewUser = (profile: any) => new Users({
  accessToken: profile.accessToken,
  refreshToken: profile.refreshToken,
  user_id: profile.data[0].id,
  login: profile.data[0].login,
  display_name: profile.data[0].display_name,
  image: profile.data[0].profile_image_url,
  user_link: createUUID(),
  last_signin: createDate(),
  users: [],
  muteUsers: [],
  premUsers: [],
  type: 4,
  stats: 0
});