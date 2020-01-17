require('dotenv').config();
import axios from 'axios';
import { Settings, DBSettings } from "../../models/settings";

const SESSION_SECRET = process.env.SESSION_SECRET;
const FOLLOW_SECRET = process.env.FOLLOW_SECRET;
const FOLLOW_ID = process.env.FOLLOW_ID;

export const followChannel = (c: number, id: any) => {
  Settings.findOne({ secret: SESSION_SECRET }).then((settings: DBSettings | null) => {
    if (settings) {
      if (c <= 1) {
        axios.put(`https://api.twitch.tv/kraken/users/464971806/follows/channels/${id}`, '', {
          headers: {
            'Authorization': `OAuth ${settings.accessToken}`,
            'Client-ID': FOLLOW_ID,
            'Accept': 'application/vnd.twitchtv.v5+json'
          }
        }).then(() => '').catch((e: { response: { data: any; }; }) => {
          console.log(e.response.data)
          axios.post(`https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${settings.refreshToken}&client_id=${FOLLOW_ID}&client_secret=${FOLLOW_SECRET}`).then((_refresh: { data: { access_token: any; refresh_token: any; }; }) => {
            Settings.updateOne({
              secret: SESSION_SECRET
            }, {
              $set: {
                "accessToken": _refresh.data.access_token,
                "refreshToken": _refresh.data.refresh_token
              }
            }).then(() => {
              setTimeout(() => {
                followChannel(c += 1, id);
              }, 1000)
            });
          }).catch((e: { response: { data: any; }; }) => console.log(e.response.data))
        });
      }
    }
  });
}