import { Users, DBUser } from "../../models/users";
import { handle } from "./getApp";
import { Express } from "express";
//@ts-ignore
import md5 from 'md5';
import { Settings } from "../../models/settings";

const SESSION_SECRET = process.env.SESSION_SECRET;
const FRONT = process.env.FRONT;

export const getApi = (server: Express, passport: any) => {
  server.get('/api/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

  server.get('/api/auth/twitch/callback',
    passport.authenticate('twitch', {
      failureRedirect: FRONT
    }),
    function (req, res: any) {
      if (req.user === 'followersError') {
        res.redirect(`${FRONT}/followersError`);
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
            res.redirect(FRONT);
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
      res.redirect(FRONT);
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
    if (req.params.secret === SESSION_SECRET) {
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

  server.get('/api/payment/1', async (req: any, res: any) => {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      res.redirect(`${FRONT}/api/auth/twitch`);
      return;
    }

    const user = await Users.findOne({ accessToken });

    if (!user) {
      res.redirect(`${FRONT}`);
      return;
    }

    const settings = await Settings.findOne({ secret: SESSION_SECRET })

    if (!settings) {
      res.redirect(`${FRONT}`);
      return;
    }

    const MerchantLogin = 'fakebot';
    const OutSum = '200.00';
    const InvId = `${user.user_id}`;
    const Description = 'Fakebot 1 месяц';
    const pass1 = settings.roboPass1;
    const SignatureValue = md5(`${MerchantLogin}:${OutSum}:${InvId}:${pass1}`);
    res.redirect(`https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MerchantLogin}&Description=${Description}&OutSum=${OutSum}&InvoiceID=${InvId}&SignatureValue=${SignatureValue}&IsTest=1`);
  })

  server.post('/api/payment/callback', (req: any, res: any) => {
    console.log(req)

    res.send('Ok');
  })

  server.get('*', (req: any, res: any) => {
    return handle(req, res)
  })
}