import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import getConfig from 'next/config';
import axios from 'axios';

const { publicRuntimeConfig } = getConfig();

const User = () => {
  const [isPayed, setIsPayed] = useState('');

  useEffect(() => {
    axios
      .get(`${publicRuntimeConfig.BACK}/api/getUserIsPayed/${window.location.pathname.slice(1)}`)
      .then((data: any) => {
        if (!data || !data.data) return;

        if (data.data.isPayed === false) {
          setIsPayed('Необходимо продлить подписку на fakebot.pro');
        }
      });

    const audioCtx = new AudioContext();
    const audioGain = audioCtx.createGain();
    audioGain.gain.value = 1;
    audioGain.connect(audioCtx.destination);

    const queue = {
      msg: [],
      play: false,
      curr: 0,
    };

    const playQueue = () => {
      if (queue.play || !queue.msg.length) return;
      queue.play = true;
      playSound(queue.msg[0]).then(() => playQueue());
    };

    const playSound = (buff: AudioBuffer) =>
      new Promise(res => {
        const source = audioCtx.createBufferSource();
        source.buffer = buff;
        source.connect(audioCtx.destination);
        source.start();
        //@ts-ignore
        queue.curr = source;
        source.onended = function() {
          queue.play = false;
          queue.msg = queue.msg.slice(1);
          res();
        };
      });

    const socket = io(publicRuntimeConfig.BACK);

    socket.on(`play-${window.location.pathname.slice(1)}`, (data: string) => {
      audioCtx.decodeAudioData(Uint8Array.from(atob(data), c => c.charCodeAt(0)).buffer).then((_data: any) => {
        //@ts-ignore
        queue.msg.push(_data);
        if (!queue.play) {
          playQueue();
        }
      });
    });

    socket.on(`skip-${window.location.pathname.slice(1)}`, () => {
      if (queue.curr) {
        //@ts-ignore
        queue.curr.stop();
      }
    });

    socket.on(`reloadCache-${window.location.pathname.slice(1)}`, () => {
      window.location.reload();
    });

    socket.on(`isPayedNow-${window.location.pathname.slice(1)}`, () => {
      setIsPayed('');
    });
  }, []);

  return <>{isPayed}</>;
};

export default User;
