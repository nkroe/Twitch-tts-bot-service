require('dotenv').config();

import socketIO from 'socket.io';
import event from '../../lib/events';
import { Users } from '../../models/users';
import {
  play, reloadCacheHandler, getInfoHandler, skipHandler,
  muteHandler, unmuteHandler, updateUsersHandler,
  updateTypeHandler, setpremHandler, unpremHandler
} from '../eventHandlers';
import { startDb } from './startDb';
import { startUpdateStats } from './updateStats';
import { app } from './getApp';
import { createServer } from './getServer';
import { getPassport } from './passport';
import { getApi } from './getApi';

const PORT = process.env.PORT || 8080;

const passport = getPassport();

startDb();
startUpdateStats();

app.prepare().then(() => {
  const server = createServer();
  
  getApi(server, passport);

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
