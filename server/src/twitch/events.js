const event = require('../../lib/events');

export const getChannelInfo = (chan) => new Promise(res => {
    event.emit('getInfo', chan);
    event.on(`getInfoRes-${chan}`, (data) => res(data))
})

export const emitPlay = (t, target) => event.emit('play', {
    streamer: target.slice(1),
    text: [...t].filter(w => /([a-zA-Zа-яА-Я0-9+-\s])/gi.test(w)).join('')
});

export const updateType = (u, message, target, context) => {
    event.emit('updateType', {
        channel: target.slice(1),
        type: u
    });
    console.log(`На канале ${target.slice(1)} был поставлен режим ${message}`);
    client.say(target, '@' + context.username + ' Режим переключен');
}

export const updateUsers = (u, target, context) => {
    const _type = u ? 2 : 1;
    event.emit('updateUsers', {
        channel: target.slice(1),
        name: context.username,
        time: Date.now(),
        type: _type
    });
    emitPlay(text, target);
}