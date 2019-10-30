import io from 'socket.io-client';
import { useEffect } from 'react';
import { route } from 'next/dist/next-server/server/router';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig()
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
            curr: null,
            cors: false
        };

        const createUrl = text => {
            let randVoice = voice[Math.round(0 - 0.5 + Math.random() * (3-0 + 1))];
            if (!queue.cors) {
                return `${ttsApi}?voice=${randVoice}&text=${text}`;
            } else {
                return `https://cors-anywhere.herokuapp.com/${ttsApi}?voice=${randVoice}&text=${text}`;
            }
        }
        
        let playQueue = async () => {
            if (queue.play || !queue.msg.length) return;
            queue.play = true;
            loadSound(queue.msg[0]).then(() => playQueue());
        }
        
        let loadSound = text => new Promise(res => {
            fetch(createUrl(text)).then(data => {
                if (data.ok){
                    data.arrayBuffer().then(data => audioCtx.decodeAudioData(data).then(_data => {
                        playSound(_data).then(() => {
                            res();
                        })                        
                    }));
                } else {
                    queue.cors = true;
                    setTimeout(() => {
                        queue.cors = false;
                    }, 10000)
                    setTimeout(() => {
                        queue.play = false;
                        res();
                    }, 2000)
                }
            })
        })
        
        let playSound = buff => new Promise(res => {
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

        const socket = io(publicRuntimeConfig.BACK);

        socket.on('play', (data) => {
            const { user_link, text } = data;
            if (user_link === window.location.pathname.slice(1)) {
                queue.msg.push(text);
                if (!queue.play) {
                    playQueue();
                }
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

        socket.on('reloadCache', data => {
            const { user_link } = data;
            if (user_link === window.location.pathname.slice(1)) {
                window.location.reload();
            }
        });

    }, []);

    return (
        <>

        </>
    )
}

export default User;