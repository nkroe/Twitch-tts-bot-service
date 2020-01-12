import event from '../../lib/events';

export const getChannelInfo = (chan: any) => new Promise(res => {
  event.emit('getInfo', chan);
  event.on(`getInfoRes-${chan}`, (data: unknown) => res(data))
})

export const emitPlay = (t: any, target: { slice: (arg0: number) => void; }) => event.emit('play', {
  streamer: target.slice(1),
  text: [...t].filter(w => /([a-zA-Zа-яА-Я0-9\+\-\?\.\,\!\s])/gi.test(w)).join('')
});

export const updateType = (u: number, message: string, client: any, target: { slice: { (arg0: number): void; (arg0: number): void; }; }, context: { username: string; }) => {
  event.emit('updateType', {
    channel: target.slice(1),
    type: u
  });
  console.log(`На канале ${target.slice(1)} был поставлен режим ${message}`);
  client.say(target, '@' + context.username + ' Режим переключен');
}

export const updateUsers = (u: any, text: string, target: { slice: (arg0: number) => void; }, context: { username: any; }) => {
  const _type = u ? 2 : 1;
  event.emit('updateUsers', {
    channel: target.slice(1),
    name: context.username,
    time: Date.now(),
    type: _type
  });
  emitPlay(text, target);
}