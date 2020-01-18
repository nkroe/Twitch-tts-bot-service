require('dotenv').config();

import { getChannelInfo, emitPlay, updateType, updateUsers } from './events';

import tmi from 'tmi.js';
import event from '../../lib/events';

export const getClient = (client_channel: any) => {

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

    //@ts-ignore
    const client = new tmi.client(opts);
    client.on('message', onMessageHandler);
    client.on('connected', () => {
        console.log(`${client_channel} is ready!`)
    });
    client.connect();

    const creator = 'fake_fake_fake_';

    function onMessageHandler(target: { slice: any; }, context: { [x: string]: string; username: any; badges?: any; }, msg: string, self: any) {

        if (self) return;

        msg = msg.replace(/%|🇳🇪|π/gi, '').replace(/ё/gi, 'е');
        let text = msg.split(' ').slice(1).join(' ');

        getChannelInfo(target.slice(1)).then(channelInfo => {
            //@ts-ignore
            let { chan, users, premUsers, muteUsers, type } = channelInfo;

            let badWords = ['пид', 'ниг', 'pid', 'nig'];
            let regWords = new RegExp(badWords.join('|'), 'gi');

            if (chan !== target.slice(1)) return;

            const isPrem = () => ((context.badges && (context.badges.moderator || context.badges.broadcaster)) || (context.username === creator));
            const isSub = () => ((type === 2) && (context.badges && (context.badges.subscriber || context.badges.founder || context.badges.vip)));
            const isVip = () => ((type === 3) && (context.badges && context.badges.vip));
            const isHighlight = () => ((type === 4) && (context['msg-id'] === 'highlighted-message') && ((!muteUsers.map((w: { name: { toLowerCase: () => void; }; }) => w.name.toLowerCase()).includes(context.username)) || isPrem()));
            const premMode = () => ((type === 5) && (premUsers.map((w: { name: any; }) => w.name).includes(context.username.toLowerCase()) || (context.username === creator)));

            let user = users.find((w: { name: any; }) => w.name === context.username);

            if (isHighlight()) {
                const t = msg.replace(regWords, '');
                emitPlay(t, target)
            } else

            if (/^!fake /gi.test(msg) && (type !== 4)) {
                if (isPrem()) {
                    if (context.username === creator) {
                        emitPlay(text, target);
                    } else if (text.length <= 250) {
                        emitPlay(text, target);
                    }
                } else {
                    if (premMode()) {
                        const t = text.replace(regWords, '');
                        emitPlay(t, target)
                    } else 
                    
                    if (
                        (muteUsers.map((w: { name: { toLowerCase: () => void; }; }) => w.name.toLowerCase()).includes(context.username)) ||
                        (regWords.test([...text.split('')].filter(w => /([a-zA-Zа-яА-Я0-9+-])/gi.test(w)).join('')) || text.length > (context.badges && (context.badges.subscriber || context.badges.founder || context.badges.vip) ? 250 : 150)) ||
                        (user && ((Date.now() / 1000 - user.time / 1000) < (context.badges && (context.badges.subscriber || context.badges.founder || context.badges.vip) ? 15 : 30)))
                    ) {
                        return;
                    } else

                    if (isSub()) {
                        updateUsers(user, text, target, context)
                    } else

                    if (isVip()) {
                        updateUsers(user, text, target, context)
                    } else

                    if (type === 1) {
                        updateUsers(user, text, target, context)
                    }
                }
            } else

            if (/^!fakecache$/gi.test(msg) && ((context.badges && context.badges.broadcaster) || (context.username === creator))) {
                event.emit('reloadCache', {
                    streamer: target.slice(1)
                });
                console.log(`На канале ${target.slice(1)} был обновлен кэш`);
                client.say(target, `@${context.username} кэш обновлен`);
            } else

            if (isPrem()) {
                if (/^!fakesub$/gi.test(msg)) {
                    updateType(2, 'сабы и выше', client, target, context);
                } else

                if (/^!fakevip$/gi.test(msg)) {
                    updateType(3, 'випы и выше', client, target, context);
                } else

                if (/^!fakemsg$/gi.test(msg)) {
                    updateType(4, 'выделенные сообщения', client, target, context);
                } else

                if (/^!fakeall$/gi.test(msg)) {
                    updateType(1, 'всех', client, target, context);
                } else

                if (/^!fakeprem$/gi.test(msg)) {
                    updateType(5, 'премиум пользователи', client, target, context);
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

                if (/^!fakeunmute ([a-zA-Z0-9_])+$/gi.test(msg.trim())) {
                    if (msg.split(' ')[1]) {
                        event.emit('unmute', {
                            channel: target.slice(1),
                            name: msg.split(' ')[1].toLowerCase()
                        });
                        console.log(`На канале ${target.slice(1)} был разблокирован пользователь ${msg.split(' ')[1]}`);
                        client.say(target, `@${context.username} для пользователя @${msg.split(' ')[1]} голосовой бот снова доступен`);
                    }
                } else

                if (/^!fakesetprem ([a-zA-Z0-9_])+$/gi.test(msg.trim()) && !premUsers.includes(context.username)) {
                    let user = msg.split(' ')[1].toLowerCase();
                    event.emit('setprem', {
                        channel: target.slice(1),
                        name: user
                    });
                    console.log(`На канале ${target.slice(1)} был добавлен премиум пользователь ${user}`);
                    client.say(target, `@${context.username} пользователь @${user} был добавлен в премиум режим`);
                } else

                if (/^!fakeunprem ([a-zA-Z0-9_])+$/gi.test(msg.trim())) {
                    if (msg.split(' ')[1]) {
                        event.emit('unprem', {
                            channel: target.slice(1),
                            name: msg.split(' ')[1].toLowerCase()
                        });
                        console.log(`На канале ${target.slice(1)} был удален пользователь ${msg.split(' ')[1]} из премиума`);
                        client.say(target, `@${context.username} для пользователя @${msg.split(' ')[1]} больше не доступен премиум режим`);
                    }
                }
            }
        })
    };

    return client;
}