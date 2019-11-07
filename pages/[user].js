import io from 'socket.io-client';
import { useEffect } from 'react';
import { route } from 'next/dist/next-server/server/router';
import getConfig from 'next/config';
import Speech from 'speak-tts'

const { publicRuntimeConfig } = getConfig()

const User = () => {

    useEffect(() => {
        const speech = new Speech();
        speech.init({
            'volume': 2,
            'lang': 'ru-RU',
            'rate': 1.7,
            'pitch': 0.01,
            'voice': 'Microsoft Irina Desktop - Russian',
            'splitSentences': true,
            'listeners': {
                'onvoiceschanged': () => ''
            }
        }).then((data) => '').catch(e => '');
        
        let queue = {
            msg: [],
            play: false
        };
        
        let playQueue = async () => {
            if (queue.play || !queue.msg.length) return;
            queue.play = true;
            loadSound(queue.msg[0]).then(() => playQueue());
        }
        
        let loadSound = text => new Promise(res => {
            speech.speak({
                text: text,
                queue: false,
                listeners: {
                    onstart: () => '',
                    onend: () => {
                        queue.msg = queue.msg.slice(1);
                        queue.play = false;
                        res();
                    }
                }
            }).then(() => '').catch(e => '')
        })

        const socket = io(publicRuntimeConfig.BACK);

        socket.on(`play-${window.location.pathname.slice(1)}`, data => {
            queue.msg.push(data);
            if (!queue.play) {
                playQueue();
            }
        });
        
        socket.on(`skip-${window.location.pathname.slice(1)}`, () => {
            if (queue.msg.length) {
                speech.cancel();
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
