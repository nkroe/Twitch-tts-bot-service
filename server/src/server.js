require('dotenv').config();

const mongoose = require('mongoose');
const { Users } = require('./users');
const { Settings } = require('./settings');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const request = require('request');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const next = require('next');
const socketIO = require('socket.io');
const event = require('../lib/events');
const fetch = require('node-fetch');

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
const PORT = process.env.PORT || 8080;
const FOLLOW_ID = process.env.FOLLOW_ID;
const FOLLOW_SECRET = process.env.FOLLOW_SECRET;
const TTS_API = process.env.TTS_API;
const OAUTH_TOKEN = process.env.OAUTH_TOKEN;

mongoose.connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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

const createDate = () => {
    const date = new Date();
    return (((date.getUTCHours() + 5).toString().length === 1 ? ('0' + (date.getUTCHours() + 5)) : (date.getUTCHours() + 5)) + ':' + (date.getMinutes().toString().length === 1 ? ('0' + date.getMinutes()) : date.getMinutes()) + ':' + (date.getSeconds().toString().length === 1 ? ('0' + date.getSeconds()) : date.getSeconds()) + ' ' + (date.getDate().toString().length === 1 ? ('0' + date.getDate()) : date.getDate()) + '.' + ((date.getMonth() + 1).toString().length === 1 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1)) + '.' + date.getFullYear());
}

const updateToken = () => {
    const body = JSON.stringify({
        "yandexPassportOauthToken": OAUTH_TOKEN
    });
    axios.post('https://iam.api.cloud.yandex.net/iam/v1/tokens', body).then(data => {
        Settings.updateOne({
            secret: SESSION_SECRET
        }, {
            $set: {
                "ttsToken": data.data.iamToken
            }
        }).then(() => '');
    }).catch(e => console.log(`Error ${e}`))
}

updateToken();

setInterval(() => {
    updateToken();
}, 1000 * 60 * 60)

const rand = (min, max) => Math.round(min - 0.5 + Math.random() * (max - min + 1));

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
                last_signin: createDate(),
                users: [],
                muteUsers: [],
                premUsers: [],
                type: 1
            });
            Users.find({
                "user_id": profile.data[0].id
            }).then((data) => {
                if (data.length === 0) {
                    getUser.save().then(() => {
                        let count = 0;
                        const followChannel = c => {
                            Settings.find({
                                secret: SESSION_SECRET
                            }).then(_settings => {
                                if (_settings.length) {
                                    if (c <= 1) {
                                        axios.put(`https://api.twitch.tv/kraken/users/464971806/follows/channels/${profile.data[0].id}`, '', {
                                            headers: {
                                                'Authorization': `OAuth ${_settings[0].accessToken}`,
                                                'Client-ID': FOLLOW_ID,
                                                'Accept': 'application/vnd.twitchtv.v5+json'
                                            }
                                        }).then(() => '').catch(e => {
                                            console.log(e.response.data)
                                            axios.post(`https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${_settings[0].refreshToken}&client_id=${FOLLOW_ID}&client_secret=${FOLLOW_SECRET}`).then(_refresh => {
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
                                            }).catch(e => console.log(e.response.data))
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
        Users.find({
            accessToken: req.params.accessToken
        }).then(data => {
            if (data.length) {
                res.send(data[0]);
            } else {
                res.send({
                    status: 'error'
                })
            }
        })
    });

    server.get('/api/getAllUsers/:secret', function (req, res) {
        if (req.params.secret === process.env.SESSION_SECRET) {
            Users.find().then(data => {
                if (data.length) {
                    res.send(data.map(w => w.login));
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

    server.get('*', (req, res) => {
        return handle(req, res)
    })

    const _server = server.listen(PORT, (err) => {
        if (err) throw err
        console.log('Server is started :)')
    })

    const chat = require('../lib/chat-bot');
    const tgBot = require('../lib/tgBot');

    const io = socketIO(_server);

    event.on('play', ({
        streamer,
        text
    }) => {
        Users.find({
            login: streamer
        }).then(_data => {
            if (_data.length) {
                Settings.find({
                    secret: SESSION_SECRET
                }).then(async settings => {
                    if (settings.length) {
                        const res = await fetch(encodeURI(`${TTS_API}?text=${text}&lang=ru-RU&voice=${['zahar', 'oksana'][rand(0,1)]}&emotion=neutral&folderId=${settings[0].folder}`), {
                            method: 'POST',
                            headers: {
                                "Authorization": `Bearer ${settings[0].ttsToken}`,
                                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                            }
                        })
                        res.arrayBuffer().then(buff => io.emit(`play-${_data[0].user_link}`, buff))
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
        }).then(_data => {
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
        }).then(_data => {
            if (_data.length) {
                io.emit(`reloadCache-${_data[0].user_link}`, '')
            }
        })
    })

    event.on('mute', (data) => {
        Users.find({
            login: data.channel
        }).then(_data => {
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

    event.on('unmute', (data) => {
        Users.find({
            login: data.channel
        }).then(_data => {
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
        Users.find({
            login: data
        }).then(_data => {
            if (_data.length) {
                let _users = _data[0].muteUsers.filter(w => w.time > (Date.now() / 1000));
                if (
                    (_data[0].muteUsers.length !== _users.length) ||
                    (_data[0].muteUsers.map(w => w.name).filter(w => _users.map(e => e.name).includes(w)).length !== _users.length)
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
                event.emit('getInfoRes', {
                    chan: data,
                    users: _data[0].users,
                    muteUsers: _users,
                    premUsers: _data[0].premUsers,
                    type: _data[0].type
                })
            }
        })
    })

    event.on('updateUsers', (data) => {
        Users.find({
            login: data.channel
        }).then(_data => {
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
                    let _users = _data[0].users.map(w => (w.name === data.name ? {
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

    event.on('updateType', (data) => {
        Users.find({
            login: data.channel
        }).then(_data => {
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

    event.on('setprem', (data) => {
        Users.find({
            login: data.channel
        }).then(_data => {
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

    event.on('unprem', (data) => {
        Users.find({
            login: data.channel
        }).then(_data => {
            if (_data.length) {
                let _premUsers = _data[0].premUsers.filter(w => w.name !== data.name);
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