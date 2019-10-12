require('dotenv').config();

const mongoose       = require('mongoose');
const { Users }      = require('./users');
const express        = require('express');
const session        = require('express-session');
const passport       = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const request        = require('request');
const cookieParser   = require('cookie-parser');
const axios          = require('axios');
const next           = require('next');
const socketIO       = require('socket.io');
const event          = require('../lib/events');

const dev = process.env.NODE_ENV !== 'production';
const app = next({
    dev
});
const handle = app.getRequestHandler();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = `${process.env.BACK}/api/auth/twitch/callback`;
const MONGO = process.env.MONGO;

let acc = '';
let ref = '';

const createUUID = () => {
    const pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return pattern.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  };

app.prepare().then(() => {
    const server = express();

    server.use(session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }));

    server.use(passport.initialize());
    server.use(passport.session());
    server.use(cookieParser());

    OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
        var options = {
            url: 'https://api.twitch.tv/helix/users',
            method: 'GET',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Authorization': 'Bearer ' + accessToken
            }
        };

        request(options, function (error, response, body) {
            if (response && response.statusCode == 200) {
                done(null, JSON.parse(body));
            } else {
                done(JSON.parse(body));
            }
        });
    }

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
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
        function (accessToken, refreshToken, profile, done) {
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
                users: [],
                muteUsers: [],
                type: 1
            });
            Users.find({
                "user_id": profile.data[0].id
            }).then((data) => {
                if (data.length === 0) {
                    getUser.save().then(() => event.emit('addChannel', profile.data[0].login));
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
                        }
                    }).then(() => {
                        console.log('Update done');
                    })
                }
            });
            done(null, profile);
        }
    ));

    server.get('/api/auth/twitch', passport.authenticate('twitch', {
        scope: 'user_read'
    }));

    server.get('/api/auth/twitch/callback',
        passport.authenticate('twitch', {
            failureRedirect: process.env.FRONT
        }),
        function (req, res) {
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
    );

    server.get('/api/logout',
        function (req, res) {
            req.logout();
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.redirect(process.env.FRONT);
        }
    );

    server.get('/api/getUser/:accessToken', function (req, res) {
        Users.find({ accessToken: req.params.accessToken }).then(data => {
            if (data.length) {
                res.send(data[0]);
            } else {
                res.send({ status: 'error' })
            }
        })
    });

    server.get('/api/getAllUsers', function (req, res) {
        Users.find().then(data => {
            if (data.length) {
                res.send(data.map(w => w.login));
            } else {
                res.send({ status: 'error' })
            }
        })
    });

    server.get('*', (req, res) => {
        return handle(req, res)
    })

    const _server = server.listen(8080, (err) => {
        if (err) throw err
        console.log('Server is started :)')
    })

    const chat = require('../lib/chat-bot');
    
    const io = socketIO(_server);

    event.on('play', (data) => {
        const { streamer, text } = data;
        Users.find({ login: streamer }).then(_data => {
            if (_data.length) {
                io.emit('play', { user_link: _data[0].user_link, text })
            }
        })
    });

    event.on('skip', (data) => {
        const { streamer } = data;
        Users.find({ login: streamer }).then(_data => {
            if (_data.length) {
                io.emit('skip', { user_link: _data[0].user_link })
            }
        })
    })

    event.on('mute', (data) => {
        Users.find({ login: data.channel }).then(_data => {
            if (_data.length) {
                let _muteUsers = _data[0].muteUsers.concat((({ channel, ...w }) => w)(data));
                Users.updateOne({
                    login: data.channel
                }, {
                    $set: {
                        "muteUsers": _muteUsers
                    }
                }).then(() => '')
            }
        })
    })

    event.on('unmute', (data) => {
        Users.find({ login: data.channel }).then(_data => {
            if (_data.length) {
                let _muteUsers = _data[0].muteUsers.filter(w => w.name !== data.name);
                Users.updateOne({
                    login: data.channel
                }, {
                    $set: {
                        "muteUsers": _muteUsers
                    }
                }).then(() => '')
            }
        })
    })

    event.on('getInfo', (data) => {
        Users.find({ login: data }).then(_data => {
            if (_data.length) {
                event.emit('getInfoRes', { chan: data, users: _data[0].users.filter(w => w.time > Date.now() / 1000), muteUsers: _data[0].muteUsers, type: _data[0].type })
            }
        })
    })

    event.on('updateUsers', (data) => {
        Users.find({ login: data.channel }).then(_data => {
            if (_data.length) {
                if (data.type === 1){
                    let _users = _data[0].users.concat((({ channel, type, ...w }) => w)(data));
                    Users.updateOne({
                        login: data.channel
                    }, {
                        $set: {
                            "users": _users
                        }
                    }).then(() => '')
                } else if (data.type === 2) {
                    let _users = _data[0].users.map(w => (w.name === data.name ? { name: w.name, time: data.time } : w));
                    Users.updateOne({
                        login: data.channel
                    }, {
                        $set: {
                            "users": _users
                        }
                    }).then(() => '')
                }
            }
        })
    })

    event.on('updateType', (data) => {
        Users.find({ login: data.channel }).then(_data => {
            if (_data.length) {
                Users.updateOne({
                    login: data.channel
                }, {
                    $set: {
                        "type": data.type
                    }
                }).then(() => '')
            }
        })
    })

    io.on('connection', socket => {
        console.log('Client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnect')
        })
    })
    
}).catch((ex) => {
    process.exit(1)
    console.error(ex.stack)
})