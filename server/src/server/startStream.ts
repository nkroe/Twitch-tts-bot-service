import { spawn } from 'child_process';

require('dotenv').config();

const STREAM_KEY = process.env.STREAM_KEY;

export const startStream = () =>
  spawn('ffmpeg', [
    '-nostdin',
    '-framerate',
    '15',
    '-re',
    '-loop',
    '1',
    '-i',
    './static/test.png',
    '-vf',
    `drawtext="fontfile=monofonto.ttf: fontsize=18: box=1: boxcolor=black@0.75: boxborderw=5: fontcolor=white: x=(w-text_w)/2: y=((h-text_h)/2): textfile=./static/message.txt: reload=1`,
    '-r',
    '15',
    '-f',
    'flv',
    '-vcodec',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-preset',
    'ultrafast',
    '-g',
    '30',
    `rtmp://live-hel.twitch.tv/app/${STREAM_KEY}`,
  ]);
