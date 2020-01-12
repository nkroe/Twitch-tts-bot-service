import socketIO from 'socket.io';
import { Users } from '../../models/users';
import { EventHandler } from './types';

type Type = EventHandler<{ io: socketIO.Server }, { streamer: string }>;

export const reloadCacheHandler: Type = ({ io }) => async ({ streamer }) => {
  const user = await Users.findOne({ login: streamer });

  if (!user) return;

  io.emit(`reloadCache-${user.user_link}`, '');
};
