process.env["NTBA_FIX_319"] = '1';
require('dotenv').config();

import TelegramBot from 'node-telegram-bot-api';
import event from '../../lib/events';

const bot = new TelegramBot(process.env.TOKEN || '', { polling: true });

// @ts-ignore
bot.on("message", function (msg: { text: { split: { (arg0: string): any[]; (arg0: string): { slice: (arg0: number) => { join: (arg0: string) => void; }; }; }; }; }) {
  const [streamer, text] = [msg.text.split(' ')[0], msg.text.split(' ').slice(1).join(' ')];
  event.emit('play', {
    streamer,
    text
  });
});

bot.on("polling_error", (err: any) => console.log(err));

export const tgBot = () => bot;