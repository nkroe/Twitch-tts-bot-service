import io from 'socket.io-client';
import { useEffect } from 'react';
import { route } from 'next/dist/next-server/server/router';

const voice = ['ru-RU-Wavenet-A', 'ru-RU-Wavenet-B', 'ru-RU-Wavenet-C', 'ru-RU-Wavenet-D'];
const ttsApi = 'https://api.streamelements.com/kappa/v2/speech';

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
            if (!queue.msg.length || queue.play) return;
            playSound(queue.msg[0]).then(() => playQueue()).catch(() => '')
        }
        
        let loadSound = text => {
            let randVoice = voice[Math.round(0 - 0.5 + Math.random() * (3-0 + 1))];
            fetch(`${ttsApi}?voice=${randVoice}&text=${text}`).then(data => {
                data.arrayBuffer().then(data => audioCtx.decodeAudioData(data).then(_data => {
                    queue.msg.push(_data);
                    playQueue();
                }));
            }).catch(() => '')
        }
        
        let playSound = buff => new Promise(res => {
            queue.play = true;
            let source = audioCtx.createBufferSource();
            source.buffer = buff;
            source.connect(audioCtx.destination);
            source.start();
            queue.curr = source;
            source.onended = function() {
                queue.play = false;
                queue.msg = queue.msg.slice(1);
                res();
            }
        })

        const socket = io(process.env.BACK);

        socket.on('play', (data) => {
            const { user_link, text } = data;
            if (user_link === window.location.pathname.slice(1)) {
                loadSound(text);
            }
        });
        
        socket.on('skip', data => {
            const { user_link } = data;
            if (user_link === window.location.pathname.slice(1)) {
                if (queue.curr) {
                    queue.curr.stop();
                    queue.play = false;
                    queue.msg = queue.msg.slice(1);
                }
            }
        });
    }, []);

    return (
        <>

        </>
    )
}

export default User;