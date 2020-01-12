import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
export const app = next({ dev });
export const handle = app.getRequestHandler()