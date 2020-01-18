import { Users, DBUser } from "../../models/users";
import { handle } from "./getApp";
import { Express } from "express";

export const getApi = (server: Express, passport: any) => {
  server.get('/api/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

  server.get('/api/auth/twitch/callback',
    passport.authenticate('twitch', {
      failureRedirect: process.env.FRONT
    }),
    function (req, res: any) {
      if (req.user === 'followersError') {
        res.redirect(`${process.env.FRONT}/followersError`);
      } else {
        //@ts-ignore
        const { accessToken, refreshToken } = req.user;
        try {
          res.cookie('accessToken', accessToken, {
            maxAge: 21600000,
            httpOnly: false
          });
          res.cookie('refreshToken', refreshToken, {
            maxAge: 21600000,
            httpOnly: false
          });
          setTimeout(_ => {
            res.redirect(process.env.FRONT);
          }, 1000);
        } catch (e) {
          console.log(`Callback set cookie: ${e.message}`);
        }
      }
    }
  );

  server.get('/api/logout', (req: { logout: () => void; }, res: any) => {
      req.logout();
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.redirect(process.env.FRONT);
    }
  );

  server.get('/api/getUser/:accessToken', function (req: { params: { accessToken: any; }; }, res: { send: { (arg0: any): void; (arg0: { status: string; }): void; }; }) {
    Users.findOne({ accessToken: req.params.accessToken }).then((user: DBUser | null) => {
      if (user) {
        res.send(user);
      } else {
        res.send({
          status: 'error'
        })
      }
    })
  });

  server.get('/api/getAllUsers/:secret', function (req: { params: { secret: string | undefined; }; }, res: any) {
    if (req.params.secret === process.env.SESSION_SECRET) {
      Users.find().then((data: { length: any; map: (arg0: (w: any) => any) => void; }) => {
        if (data.length) {
          res.send(data.map((w: { login: any; }) => w.login));
        } else {
          res.send({
            status: 'error'
          })
        }
      })
    } else {
      res.send({
        status: 'Error'
      })
    }
  });

  server.get('*', (req: any, res: any) => {
    return handle(req, res)
  })
}