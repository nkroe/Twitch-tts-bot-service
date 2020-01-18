require('dotenv').config();

import passport from 'passport';
import request from 'request';
import axios from 'axios';
import socketIO from 'socket.io';
import event from '../../lib/events';
import { createDate } from '../../lib/createDate';
import { Users, DBUser } from '../../models/users';
import { Settings, DBSettings } from '../../models/settings'
import {
  play, reloadCacheHandler, getInfoHandler, skipHandler,
  muteHandler, unmuteHandler, updateUsersHandler,
  updateTypeHandler, setpremHandler, unpremHandler
} from '../eventHandlers';
import { startDb } from './startDb';
import { startUpdateStats } from './updateStats';
import { app, handle } from './getApp';
import { createServer } from './getServer';
import { followChannel } from './followChannel';
import { getNewUser } from './getNewUser';
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = `${process.env.BACK}/api/auth/twitch/callback`;
const PORT = process.env.PORT || 8080;
const FOLLOW_ID = process.env.FOLLOW_ID;

startDb();
startUpdateStats();

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
    (accessToken: any, refreshToken: any, profile: { accessToken: string; refreshToken: string; data: any }, done: (arg0: null, arg1: any) => void) => {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;

      Users.findOne({ "user_id": profile.data[0].id }).then((user: DBUser | null) => {
        if (!user) {
          Settings.findOne({ secret: SESSION_SECRET }).then(async (settings: DBSettings | null) => {
            if (settings) {
              const countOfFollowers = await axios.get(`https://api.twitch.tv/kraken/channels/${profile.data[0].id}/follows`, {
                headers: {
                  'Client-ID': FOLLOW_ID,
                  'Accept': 'application/vnd.twitchtv.v5+json'
                }
              });
    
              if (!settings.paidUsers.includes(profile.data[0].login) && (countOfFollowers?.data?._total < 5000)) {
                done(null, 'followersError');
                return;
              };
    
              const newUser = getNewUser(profile);
    
              newUser.save().then(() => {
                done(null, profile);
                followChannel(0, profile.data[0].id);
                event.emit('addChannel', profile.data[0].login);
              })
            }
          });
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
          })
        }
      });
    }));

  server.get('/api/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

  server.get('/api/auth/twitch/callback',
    passport.authenticate('twitch', {
      failureRedirect: process.env.FRONT
    }),
    function (req, res: any) {
      if (req.user === 'followersError') {
        res.redirect(`${process.env.FRONT}/followersError`);
      } else {
        //@ts-ignore
        const { accessToken, refreshToken } = req.user;
        try {
          res.cookie('accessToken', accessToken, {
            maxAge: 21600000,
            httpOnly: false
          });
          res.cookie('refreshToken', refreshToken, {
            maxAge: 21600000,
            httpOnly: false
          });
          setTimeout(_ => {
            res.redirect(process.env.FRONT);
          }, 1000);
        } catch (e) {
          console.log(`Callback set cookie: ${e.message}`);
        }
      }
    }
  );

  server.get('/api/logout', (req: { logout: () => void; }, res: any) => {
      req.logout();
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.redirect(process.env.FRONT);
    }
  );

  server.get('/api/getUser/:accessToken', function (req: { params: { accessToken: any; }; }, res: { send: { (arg0: any): void; (arg0: { status: string; }): void; }; }) {
    Users.findOne({ accessToken: req.params.accessToken }).then((user: DBUser | null) => {
      if (user) {
        res.send(user);
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

  event.on('play', play({ io }));

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
