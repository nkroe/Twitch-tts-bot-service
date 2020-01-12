import socketIO from 'socket.io';
import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<{ io: socketIO.Server }, { streamer: string }>;

export const skipHandler: Type = ({ io }) => async ({ streamer }) => {
  Users.findOne({ login: streamer }).then(user => {
    if (!user) return;

    io.emit(`skip-${user.user_link}`, '')
  })
};
