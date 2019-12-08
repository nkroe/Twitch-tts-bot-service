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
            curr: 0
        };

        let playQueue = () => {
            if (queue.play || !queue.msg.length) return;
            queue.play = true;
            playSound(queue.msg[0]).then(() => playQueue());
        }

        let playSound = (buff: any) => new Promise(res => {
            let source = audioCtx.createBufferSource();
            source.buffer = buff;
            source.connect(audioCtx.destination);
            source.start();
            //@ts-ignore
            queue.curr = source;
            source.onended = function () {
                queue.play = false;
                queue.msg = queue.msg.slice(1);
                res();
            }
        })

        const socket = io(publicRuntimeConfig.BACK);

        socket.on(`play-${window.location.pathname.slice(1)}`, (data: string) => {
            audioCtx.decodeAudioData((Uint8Array.from(atob(data), c => c.charCodeAt(0))).buffer).then((_data: any) => {
                //@ts-ignore
                queue.msg.push(_data);
                if (!queue.play) {
                    playQueue();
                }
            })
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

    }, []);

    return ( 
        <>

        </>
    )
}

export default User;