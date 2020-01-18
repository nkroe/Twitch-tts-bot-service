import passport from 'passport';
import { getNewOAuth } from './getNewOAuth';

passport.serializeUser(function (user: any, done: (arg0: null, arg1: any) => void) {
  done(null, user);
});

passport.deserializeUser(function (user: any, done: (arg0: null, arg1: any) => void) {
  done(null, user);
});

passport.use('twitch', getNewOAuth());

export const getPassport = () => passport;