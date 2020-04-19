import event from '../../lib/events';
import { getClient } from './clientHandler';
import axios from 'axios';

require('dotenv').config();

let channels: { channel: string; tmiClient: any }[] = [];

event.on('addChannel', (_channel: string) => {
  const channel = channels.find(chan => chan.channel === _channel);

  if (channel) return;

  channels.push({ channel: _channel, tmiClient: getClient(_channel) });
});

export const chatBot = () => {
  setTimeout(() => {
    axios.get(`${process.env.BACK}/api/getAllUsers/${process.env.SESSION_SECRET}`).then((data: any) => {
      const { users } = data.data;

      if (!users) return;

      channels = users.map((user: string) => ({ channel: user, tmiClient: getClient(user) }));
    });
  }, 10000);
};
