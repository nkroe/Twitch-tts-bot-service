import io from 'socket.io-client';
import { useEffect } from 'react';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig()

const User = () => {

    useEffect(() => {
        let audioCtx = new AudioContext();
        let audioGain = audioCtx.createGain();
        audioGain.gain.value = 1;
        audioGain.connect(audioCtx.destination);

        let queue = {
            msg: [],
            play: false,
            curr: null
        };

        let playQueue = () => {
            if (queue.play || !queue.msg.length) return;
            queue.play = true;
            playSound(queue.msg[0]).then(() => playQueue());
        }

        let playSound = buff => new Promise(res => {
            let source = audioCtx.createBufferSource();
            source.buffer = buff;
            source.connect(audioCtx.destination);
            source.start();
            queue.curr = source;
            source.onended = function () {
                queue.play = false;
                queue.msg = queue.msg.slice(1);
                res();
            }
        })

        const socket = io(publicRuntimeConfig.BACK);

        socket.on(`play-${window.location.pathname.slice(1)}`, data => {
            audioCtx.decodeAudioData((Uint8Array.from(atob(data), c => c.charCodeAt(0))).buffer).then(_data => {
                queue.msg.push(_data);
                if (!queue.play) {
                    playQueue();
                }
            })
        });

        socket.on(`skip-${window.location.pathname.slice(1)}`, () => {
            if (queue.curr) {
                queue.curr.stop();
            }
        });

        socket.on(`reloadCache-${window.location.pathname.slice(1)}`, () => {
            window.location.reload();
        });

    }, []);

    return ( 
        <>

        </>
    )
}

export default User;