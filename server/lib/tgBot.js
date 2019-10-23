process.env["NTBA_FIX_319"] = 1;
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const event = require('./events');

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

bot.on('message', function (msg) {
    const [streamer, text] = [msg.split(' ')[0], msg.split(' ').slice(1).join(' ')];
    event.emit('play', {
        streamer,
        text
    });
});

bot.on("polling_error", (err) => console.log(err));