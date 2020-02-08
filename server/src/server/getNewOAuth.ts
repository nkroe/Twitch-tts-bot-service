import request from 'request';
import { Users, DBUser } from "../../models/users";
import { getNewUser } from "./getNewUser";
import { createDate } from "../../lib/createDate";
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const CALLBACK_URL = `${process.env.BACK}/api/auth/twitch/callback`;


OAuth2Strategy.prototype.userProfile = function (accessToken: string, done: { (arg0: null, arg1: any): void; (arg0: any): void; }) {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  request(options, function (_, response: { statusCode: number; }, body: string) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
}

export const getNewOAuth = () => new OAuth2Strategy({
  authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
  tokenURL: 'https://id.twitch.tv/oauth2/token',
  clientID: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_SECRET,
  callbackURL: CALLBACK_URL,
  state: true
},
  (accessToken: any, refreshToken: any, profile: { accessToken: string; refreshToken: string; data: any }, done: (arg0: null, arg1: any) => void) => {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    Users.findOne({ "user_id": profile.data[0].id }).then(async (user: DBUser | null) => {
      if (!user) {
        const newUser = await getNewUser(profile);

        if (!newUser) return;

        newUser.save().then(() => {
          done(null, profile);
          return;
        })
      } else {
        Users.updateOne({ "user_id": profile.data[0].id }, {
          $set: {
            "accessToken": profile.accessToken,
            "refreshToken": profile.refreshToken,
            "login": profile.data[0].login,
            "display_name": profile.data[0].display_name,
            "image": profile.data[0].profile_image_url,
            "last_signin": createDate(),
          }
        }).then(() => {
          done(null, profile);
          console.log('Update done');
          return;
        })
      }
    });
  })