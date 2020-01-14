require('dotenv').config();

import passport from 'passport';
import request from 'request';
import axios from 'axios';
import socketIO from 'socket.io';
import fetch from 'node-fetch';
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

import event from '../../lib/events';
import { createDate } from '../../lib/createDate';
import { createUUID } from '../../lib/createUUID';

import { Users } from '../../models/users';
import { Settings } from '../../models/settings'

import {
  reloadCacheHandler, getInfoHandler, skipHandler,
  muteHandler, unmuteHandler, updateUsersHandler,
  updateTypeHandler, setpremHandler, unpremHandler
} from '../eventHandlers';
import { startDb } from './startDb';
import { CharsStats } from '../charsStats';
import { startUpdateStats } from './updateStats';
import { app, handle } from './getApp';
import { createServer } from './getServer';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = `${process.env.BACK}/api/auth/twitch/callback`;
const PORT = process.env.PORT || 8080;
const FOLLOW_ID = process.env.FOLLOW_ID;
const FOLLOW_SECRET = process.env.FOLLOW_SECRET;

startDb();
startUpdateStats();

let acc = '';
let ref = '';

const rand = (min: number, max: number) => Math.round(min - 0.5 + Math.random() * (max - min + 1));

app.prepare().then(() => {
  const server = createServer();

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

  passport.serializeUser(function (user: any, done: (arg0: null, arg1: any) => void) {
    done(null, user);
  });

  passport.deserializeUser(function (user: any, done: (arg0: null, arg1: any) => void) {
    done(null, user);
  });

  passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_SECRET,
    callbackURL: CALLBACK_URL,
    state: true
  },
    async (accessToken: any, refreshToken: any, profile: { accessToken: string; refreshToken: string; data: any }, done: (arg0: null, arg1: any) => void) => {
      const countOfFollowers = await axios.get(`https://api.twitch.tv/kraken/channels/${profile.data[0].id}/follows`, {
        headers: {
          'Client-ID': FOLLOW_ID,
          'Accept': 'application/vnd.twitchtv.v5+json'
        }
      });

      if (profile.data[0].login !== 'fake_fake_fake_' && (countOfFollowers?.data?._total < 2000)) {
        done(null, 'followersError');
        return;
      };

      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      acc = profile.accessToken;
      ref = profile.refreshToken;
      const getUser = new Users({
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
      Users.find({
        "user_id": profile.data[0].id
      }).then((data: { length: number; }) => {
        if (data.length === 0) {
          getUser.save().then(() => {
            let count = 0;
            const followChannel = (c: number) => {
              Settings.find({
                secret: SESSION_SECRET
              }).then((_settings: any) => {
                if (_settings.length) {
                  if (c <= 1) {
                    axios.put(`https://api.twitch.tv/kraken/users/464971806/follows/channels/${profile.data[0].id}`, '', {
                      headers: {
                        'Authorization': `OAuth ${_settings[0].accessToken}`,
                        'Client-ID': FOLLOW_ID,
                        'Accept': 'application/vnd.twitchtv.v5+json'
                      }
                    }).then(() => '').catch((e: { response: { data: any; }; }) => {
                      console.log(e.response.data)
                      axios.post(`https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${_settings[0].refreshToken}&client_id=${FOLLOW_ID}&client_secret=${FOLLOW_SECRET}`).then((_refresh: { data: { access_token: any; refresh_token: any; }; }) => {
                        Settings.updateOne({
                          secret: SESSION_SECRET
                        }, {
                          $set: {
                            "accessToken": _refresh.data.access_token,
                            "refreshToken": _refresh.data.refresh_token
                          }
                        }).then(() => {
                          count++;
                          setTimeout(() => {
                            followChannel(count);
                          }, 1000)
                        });
                      }).catch((e: { response: { data: any; }; }) => console.log(e.response.data))
                    });
                  }
                }
              });
            }
            followChannel(count);
            event.emit('addChannel', profile.data[0].login);
          })
        } else {
          Users.updateOne({
            "user_id": profile.data[0].id
          }, {
            $set: {
              "accessToken": profile.accessToken,
              "refreshToken": profile.refreshToken,
              "login": profile.data[0].login,
              "display_name": profile.data[0].display_name,
              "image": profile.data[0].profile_image_url,
              "last_signin": createDate(),
            }
          }).then(() => {
            console.log('Update done');
          })
        }
      });
      done(null, profile);
    }));

  server.get('/api/auth/twitch', passport.authenticate('twitch', {
    scope: 'user_read'
  }));

  server.get('/api/auth/twitch/callback',
    passport.authenticate('twitch', {
      failureRedirect: process.env.FRONT
    }),
    function (req, res: any) {
      if (req.user === 'followersError') {
        res.redirect(`${process.env.FRONT}/followersError`);
      } else {
        res.cookie('accessToken', acc, {
          maxAge: 21600000,
          httpOnly: false
        });
        res.cookie('refreshToken', ref, {
          maxAge: 21600000,
          httpOnly: false
        });
        setTimeout(_ => {
          res.redirect(process.env.FRONT);
        }, 1000);
      }
    }
  );

  server.get('/api/logout',
    function (req: { logout: () => void; }, res: any) {
      req.logout();
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.redirect(process.env.FRONT);
    }
  );

  server.get('/api/getUser/:accessToken', function (req: { params: { accessToken: any; }; }, res: { send: { (arg0: any): void; (arg0: { status: string; }): void; }; }) {
    Users.find({
      accessToken: req.params.accessToken
    }).then((data: any[]) => {
      if (data.length) {
        res.send(data[0]);
      } else {
        res.send({
          status: 'error'
        })
      }
    })
  });

  server.get('/api/getAllUsers/:secret', function (req: { params: { secret: string | undefined; }; }, res: any) {
    if (req.params.secret === process.env.SESSION_SECRET) {
      Users.find().then((data: { length: any; map: (arg0: (w: any) => any) => void; }) => {
        if (data.length) {
          res.send(data.map((w: { login: any; }) => w.login));
        } else {
          res.send({
            status: 'error'
          })
        }
      })
    } else {
      res.send({
        status: 'Error'
      })
    }
  });

  server.get('*', (req: any, res: any) => {
    return handle(req, res)
  })

  const _server = server.listen(PORT, () => console.log('Server is started :)'))

  const { chatBot } = require('../twitch/chat-bot');
  const { tgBot } = require('../telegram/tgBot');
  chatBot();
  tgBot();

  const io = socketIO(_server);

  event.on('play', ({
    streamer,
    text
  }) => {
    Users.findOne({
      login: streamer
    }).then(user => {
      if (!user) return;

      Settings.findOne({
        secret: SESSION_SECRET
      }).then(setting => {

        if (!setting) return;

        const body = {
          "input": {
            "text": text
          },
          "voice": {
            "languageCode": "ru-RU",
            "name": ['ru-RU-Wavenet-A', 'ru-RU-Wavenet-D'][rand(0, 1)]
          },
          "audioConfig": {
            "audioEncoding": "OGG_OPUS",
            "volumeGainDb": user.volume || 0
          }
        };

        fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${setting.apiKey}`, {
          method: 'post',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(res => {
          res.json().then(jsonData => {
            CharsStats.addStat(streamer, text.length);
            io.emit(`play-${user.user_link}`, jsonData.audioContent)
          });
        }).catch(e => {
          console.log(`На канале ${streamer} не было прочитано сообщение: ${text}`)
          console.log(e);
        })
      })
    })
  });

  event.on('skip', skipHandler({ io }))

  event.on('reloadCache', reloadCacheHandler({ io }));

  event.on('mute', muteHandler({}));

  event.on('unmute', unmuteHandler({}))

  event.on('getInfo', getInfoHandler(event));

  event.on('updateUsers', updateUsersHandler({}))

  event.on('updateType', updateTypeHandler({}))

  event.on('setprem', setpremHandler({}))

  event.on('unprem', unpremHandler({}))

  io.on('connection', (socket: socketIO.Socket) => {
    console.log('Client connected');

    socket.on('setVolume', ({ streamer, volume }: { streamer: string, volume: number }) => {
      Users.findOneAndUpdate({ accessToken: streamer }, { volume }).then(() => '')
    })

    socket.on('testVolume', ({ streamer }: { streamer: string }) => {
      Users.find({ accessToken: streamer }).then((data: any) => {
        if (data.length) {
          event.emit('play', { streamer: data[0].login, text: 'Тест' })
        }
      })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnect')
    })
  })

}).catch((ex: { stack: string }) => {
  process.exit(1)
  console.error(ex.stack)
});
