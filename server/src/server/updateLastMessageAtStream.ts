import fs from 'fs';
import { createDate } from '../../lib/createDate';

type Params = {
  user: string;
  message: string;
};

export const updateLastMessageAtStream = ({ user, message }: Params) => {
  fs.writeFileSync(
    './static/message.txt',
    `fakebot.pro last message\n\n\nChannel:\n${user}\n\nMessage:\n${message}\n\nTime: ${createDate()}`,
    'utf-8'
  );
};
