require('dotenv').config();

import event from '../../lib/events';
import { getClient } from './clientHandler';
import axios from 'axios';

export const chatBot = () => {
  setTimeout(() => {
    axios.get(`${process.env.BACK}/api/getAllUsers/${process.env.SESSION_SECRET}`).then(data => {
      let channels = data.data.map((w: any) => getClient(w));
      event.on('addChannel', (_channel: any) => channels.push(getClient(_channel)));
    });
  }, 10000)
}
