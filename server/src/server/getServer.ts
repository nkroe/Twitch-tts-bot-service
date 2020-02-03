import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

const SESSION_SECRET = process.env.SESSION_SECRET;

export const createServer = () => {
  const server = express();

  server.use(session({
    secret: SESSION_SECRET || '',
    resave: false,
    saveUninitialized: false
  }));

  server.use(cors({
    origin: process.env.BACK
  }))
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(cookieParser());
  server.use(bodyParser.json());

  return server;
};
