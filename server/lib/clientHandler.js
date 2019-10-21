require('dotenv').config();

const tmi = require('tmi.js');
const event = require('./events');

function getClient(client_channel) {

    const opts = {
        options: {
            debug: false
        },
        connection: {
            reconnect: true,
            secure: true
        },
        identity: {
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        },
        channels: [
            client_channel
        ]
    };

    const client = new tmi.client(opts);
    client.on('message', onMessageHandler);
    client.on('connected', () => {
        console.log('Chat bot is ready!')
    });
    client.connect();

    const getChannelInfo = (chan) => new Promise(res => {
        event.emit('getInfo', chan);
        event.on('getInfoRes', (data) => res(data))
    })

    function onMessageHandler(target, context, msg, self) {

        if (self) return;

        msg = msg.replace(/%|🇳🇪|π/gi, '');
        let text = msg.split(' ').slice(1).join(' ');

        const emitPlay = (t) => event.emit('play', {
            streamer: target.slice(1),
            text: t
        });

        const updateUsers = u => {
            const _type = u ? 2 : 1;
            event.emit('updateUsers', {
                channel: target.slice(1),
                name: context.username,
                time: Date.now(),
                type: _type
            });
            emitPlay(text);
        }

        const updateType = (u, message) => {
            event.emit('updateType', {
                channel: target.slice(1),
                type: u
            });
            console.log(`На канале ${target.slice(1)} был поставлен режим ${message}`);
            client.say(target, '@' + context.username + ' Режим переключен');
        }

        getChannelInfo(target.slice(1)).then(data => {

            let {
                chan,
                users,
                muteUsers,
                type
            } = data;

            let badWords = ['пид', 'ниг', 'pid', 'nig'];
            let regWords = new RegExp(badWords.join('|'), 'gi');

            if (chan !== target.slice(1)) return;

            const isPrem = () => ((context.badges && (context.badges.moderator || context.badges.broadcaster)) || (context.username === 'fake_fake_fake_'));
            const isSub = () => ((type === '2') && (context.badges && (context.badges.subscriber || context.badges.founder || context.badges.vip)));
            const isVip = () => ((type === '3') && (context.badges && context.badges.vip));
            const isHighlight = () => ((type === '4') && (context['msg-id'] === 'highlighted-message'));

            let user = users.find(w => w.name === context.username);

            if (isHighlight()) {
                const t = text.replace(regWords, '');
                emitPlay(t)
            } else

            if (/^!fake /gi.test(msg) && (type !== '4')) {
                if (isPrem()) {
                    if (context.username === 'fake_fake_fake') {
                        emitPlay(text);
                    } else if (text.length <= 250) {
                        emitPlay(text);
                    }
                } else {
                    if (
                        (muteUsers.map(w => w.name.toLowerCase()).includes(context.username)) ||
                        (regWords.test([...text].filter(w => /([a-zA-Zа-яА-Я0-9])/gi.test(w)).join('')) || text.length > (context.badges && (context.badges.subscriber || context.badges.founder || context.badges.vip) ? 250 : 150)) ||
                        (user && ((Date.now() / 1000 - user.time / 1000) < (context.badges && (context.badges.subscriber || context.badges.founder || context.badges.vip) ? 15 : 30)))
                    ) return;
                    if (isSub()) {
                        updateUsers(user)
                    } else if (isVip()) {
                        updateUsers(user)
                    } else if (type === '1') {
                        updateUsers(user)
                    }
                }
            } else

            if (isPrem()) {
                if (/^!fakesub$/gi.test(msg)) {
                    updateType('2', 'сабы и выше');
                } else

                if (/^!fakevip$/gi.test(msg)) {
                    updateType('3', 'випы и выше');
                } else

                if (/^!fakemsg$/gi.test(msg)) {
                    updateType('4', 'выделенные сообщения');
                } else

                if (/^!fakeall$/gi.test(msg)) {
                    updateType('1', 'всех');
                } else

                if (/^!skip$/gi.test(msg)) {
                    event.emit('skip', {
                        streamer: target.slice(1)
                    });
                } else

                if (/^!fakemute ([a-zA-Z0-9_])+ ([0-9])+$/gi.test(msg.trim()) && !muteUsers.includes(context.username)) {
                    let user = msg.split(' ')[1].toLowerCase();
                    let time = parseFloat(msg.split(' ')[2]) || 60;
                    event.emit('mute', {
                        channel: target.slice(1),
                        name: user,
                        time: ((Date.now() / 1000) + (time * 60))
                    });
                    console.log(`На канале ${target.slice(1)} был заблокирован пользователь ${user} на ${time} мин.`);
                    client.say(target, `@${context.username} для пользователя @${user} голосовой бот не доступен ${time} мин.`);
                } else

                if (/^!fakeunmute ([a-zA-Z0-9_])+$/gi.test(msg.trim()) && !muteUsers.includes(context.username)) {
                    if (msg.split(' ')[1]) {
                        event.emit('unmute', {
                            channel: target.slice(1),
                            name: msg.split(' ')[1].toLowerCase()
                        });
                        console.log(`На канале ${target.slice(1)} был разблокирован пользователь ${msg.split(' ')[1]}`);
                        client.say(target, `@${context.username} для пользователя @${msg.split(' ')[1]} голосовой бот снова доступен`);
                    }
                }
            }
        })
    };

    return client;
}

module.exports = getClient;