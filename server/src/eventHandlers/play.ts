require('dotenv').config();
import socketIO from 'socket.io';
import fetch from 'node-fetch';
import { Users } from '../../models/users';
import { EventHandler } from './types';
import { Settings } from '../../models/settings';
import { CharsStats } from '../charsStats';

const SESSION_SECRET = process.env.SESSION_SECRET;

const rand = (min: number, max: number) => Math.round(min - 0.5 + Math.random() * (max - min + 1));

type Type = EventHandler<{ io: socketIO.Server }, { streamer: string, text: string }>;

export const play: Type = ({ io }) => async ({ streamer, text }) => {
  Users.findOne({ login: streamer }).then(user => {
    if (!user) return;

    Settings.findOne({
      secret: SESSION_SECRET
    }).then(setting => {

      if (!setting) return;

      const body = {
        "input": {
          "text": text
        },
        "voice": {
          "languageCode": "ru-RU",
          "name": ['ru-RU-Wavenet-A', 'ru-RU-Wavenet-D'][rand(0, 1)]
        },
        "audioConfig": {
          "audioEncoding": "OGG_OPUS",
          "volumeGainDb": user.volume || 0
        }
      };

      fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${setting.apiKey}`, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        res.json().then(jsonData => {
          CharsStats.addStat(streamer, text.length);
          io.emit(`play-${user.user_link}`, jsonData.audioContent)
        });
      }).catch(e => {
        console.log(`На канале ${streamer} не было прочитано сообщение: ${text}`)
        console.log(e);
      })
    })
  })
};
