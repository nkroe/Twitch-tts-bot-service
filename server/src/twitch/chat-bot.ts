require('dotenv').config();

import event from '../../lib/events';
import { getClient } from './clientHandler';
import axios from 'axios';

let channels = [];

event.on('addChannel', (_channel: any) => channels.push(getClient(_channel)));

export const chatBot = () => {
  setTimeout(() => {
    axios.get(`${process.env.BACK}/api/getAllUsers/${process.env.SESSION_SECRET}`).then(data => {
      channels = data.data.map((w: any) => getClient(w));
    });
  }, 10000)
}