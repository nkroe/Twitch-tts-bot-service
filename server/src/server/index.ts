require('dotenv').config();

//@ts-ignore
// import { createDate } from '../../lib/createDate';

import mongoose from 'mongoose';
import { Users } from '../../models/users'
import { Settings } from '../../models/settings'
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import request from 'request';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import next from 'next';
import socketIO from 'socket.io';
import cors from 'cors';
import event from '../../lib/events';
import fetch from 'node-fetch';

const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = `${process.env.BACK}/api/auth/twitch/callback`;
const MONGO = process.env.MONGO;
const PORT = process.env.PORT || 8080;
const FOLLOW_ID = process.env.FOLLOW_ID;
const FOLLOW_SECRET = process.env.FOLLOW_SECRET;

mongoose.connect(MONGO || '', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

let acc = '';
let ref = '';
let statsMess: any[] | never[] | any[][] = [];

const createUUID = () => {
    const pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return pattern.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
};

const createDate = () => {
    const date = new Date();
    return (((date.getUTCHours() + 5).toString().length === 1 ? ('0' + (date.getUTCHours() + 5)) : (date.getUTCHours() + 5)) + ':' + (date.getMinutes().toString().length === 1 ? ('0' + date.getMinutes()) : date.getMinutes()) + ':' + (date.getSeconds().toString().length === 1 ? ('0' + date.getSeconds()) : date.getSeconds()) + ' ' + (date.getDate().toString().length === 1 ? ('0' + date.getDate()) : date.getDate()) + '.' + ((date.getMonth() + 1).toString().length === 1 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1)) + '.' + date.getFullYear());
}

setInterval(() => {
    statsMess.forEach(w => {
        Users.find({
            login: w[0]
        }).then((data: any) => {
            if (data.length) {
                Users.updateOne({
                    login: w[0]
                }, {
                    $set: {
                        stats: parseFloat(data[0].stats) + w[1]
                    }
                }).then(() => {
                    statsMess = [...statsMess].map((e: any[]) => e[0] === w[0] ? [e[0], 0] : e)
                })
            }
        })
    })
}, 1000 * 60 * 10)

const rand = (min: number, max: number) => Math.round(min - 0.5 + Math.random() * (max - min + 1));

app.prepare().then(() => {
    const server = express();

    server.use(session({
        secret: SESSION_SECRET || '',
        resave: false,
        saveUninitialized: false
    }));

    server.use(cors({
        origin: process.env.BACK
    }))
    server.use(passport.initialize());
    server.use(passport.session());
    server.use(cookieParser());

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
        function (accessToken: any, refreshToken: any, profile: { accessToken: string; refreshToken: string; data: any }, done: (arg0: null, arg1: any) => void) {
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
                type: 1,
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
        function (_, res: any) {
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
        function (req: { logout: () => void; }, res:  any) {
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
    // const tgBot = require('../telegram/tgBot');
    chatBot();

    const io = socketIO(_server);

    event.on('play', ({
        streamer,
        text
    }) => {
        Users.find({
            login: streamer
        }).then((_data: any) => {
            if (_data.length) {
                Settings.find({
                    secret: SESSION_SECRET
                }).then((settings: any) => {
                    if (settings.length) {
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
                                "volumeGainDb": _data[0].volume || 0
                            }
                        }
                        fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${settings[0].apiKey}`, {
                            method: 'post',
                            body: JSON.stringify(body),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(res => {
                            res.json().then(jsonData => {
                                //@ts-ignore
                                if (!statsMess.filter(w => w[0] === streamer).length) statsMess.push([streamer, 0])
                                statsMess = [...statsMess].map((w: (string | number)[]) => w[0] === streamer ? [w[0], w[1] + text.length] : w)
                                io.emit(`play-${_data[0].user_link}`, jsonData.audioContent)
                            })
                        }).catch(e => {
                            console.log(`На канале ${streamer} не было прочитано сообщение: ${text}`)
                            console.log(e);
                        })

                    }
                })
            }
        })
    });

    event.on('skip', ({
        streamer
    }) => {
        Users.find({
            login: streamer
        }).then((_data: any) => {
            if (_data.length) {
                io.emit(`skip-${_data[0].user_link}`, '')
            }
        })
    })

    event.on('reloadCache', ({
        streamer
    }) => {
        Users.find({
            login: streamer
        }).then((_data: any) => {
            if (_data.length) {
                io.emit(`reloadCache-${_data[0].user_link}`, '')
            }
        })
    })

    event.on('mute', (data: { channel: any; }) => {
        Users.find({
            login: data.channel
        }).then((_data: any) => {
            if (_data.length) {
                let _muteUsers = _data[0].muteUsers.concat((({
                    channel,
                    ...w
                }) => w)(data));
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

    event.on('unmute', (data: { channel: any; name: any; }) => {
        Users.find({
            login: data.channel
        }).then((_data: any) => {
            if (_data.length) {
                let _muteUsers = _data[0].muteUsers.filter((w: { name: any; }) => w.name !== data.name);
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

    event.on('getInfo', (data: any) => {
        Users.find({
            login: data
        }).then((_data: any) => {
            if (_data.length) {
                let _users = _data[0].muteUsers.filter((w: { time: number; }) => w.time > (Date.now() / 1000));
                if (
                    (_data[0].muteUsers.length !== _users.length) ||
                    (_data[0].muteUsers.map((w: { name: any; }) => w.name).filter((w: any) => _users.map((e: { name: any; }) => e.name).includes(w)).length !== _users.length)
                ) {
                    setTimeout(() => {
                        Users.updateOne({
                            login: data
                        }, {
                            $set: {
                                "muteUsers": _users
                            }
                        }).then(() => '');
                    }, 5000)
                }
                event.emit(`getInfoRes-${data}`, {
                    chan: data,
                    users: _data[0].users,
                    muteUsers: _users,
                    premUsers: _data[0].premUsers,
                    type: _data[0].type
                })
            }
        })
    })

    event.on('updateUsers', (data: { channel: any; type: number; name: any; time: any; }) => {
        Users.find({
            login: data.channel
        }).then((_data: any) => {
            if (_data.length) {
                if (data.type === 1) {
                    let _users = _data[0].users.concat((({
                        channel,
                        type,
                        ...w
                    }) => w)(data));
                    Users.updateOne({
                        login: data.channel
                    }, {
                        $set: {
                            "users": _users
                        }
                    }).then(() => '');
                } else if (data.type === 2) {
                    let _users = _data[0].users.map((w: { name: any; }) => (w.name === data.name ? {
                        name: w.name,
                        time: data.time
                    } : w));
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

    event.on('updateType', (data: { channel: any; type: any; }) => {
        Users.find({
            login: data.channel
        }).then((_data: { length: any; }) => {
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

    event.on('setprem', (data: { channel: any; }) => {
        Users.find({
            login: data.channel
        }).then((_data: any) => {
            if (_data.length) {
                let _premUsers = _data[0].premUsers.concat((({
                    channel,
                    ...w
                }) => w)(data));
                Users.updateOne({
                    login: data.channel
                }, {
                    $set: {
                        "premUsers": _premUsers
                    }
                }).then(() => '')
            }
        })
    })

    event.on('unprem', (data: { channel: any; name: any; }) => {
        Users.find({
            login: data.channel
        }).then((_data: any) => {
            if (_data.length) {
                let _premUsers = _data[0].premUsers.filter((w: { name: any; }) => w.name !== data.name);
                Users.updateOne({
                    login: data.channel
                }, {
                    $set: {
                        "premUsers": _premUsers
                    }
                }).then(() => '')
            }
        })
    })

    io.on('connection', (socket: { on: { (arg0: string, arg1: ({ streamer, volume }: any) => void): void; (arg0: string, arg1: ({ streamer }: any) => void): void; (arg0: string, arg1: () => void): void; }; }) => {
        console.log('Client connected');

        socket.on('setVolume', ({ streamer, volume }) => {
            Users.findOneAndUpdate({ accessToken: streamer }, { volume }).then(() => '')
        })

        socket.on('testVolume', ({ streamer }) => {
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

}).catch((ex: { stack: any; }) => {
    process.exit(1)
    console.error(ex.stack)
})