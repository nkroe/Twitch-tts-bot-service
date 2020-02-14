import { Users, DBUser } from "../../models/users";
import { handle } from "./getApp";
import { Express } from "express";
//@ts-ignore
import md5 from 'md5';
import { Settings } from "../../models/settings";
import { createDate } from "../../lib/createDate";
import { PaymentsPrices, PaymentsPricesValue, PaymentsDescription } from './paymentsEnumAndTypes';
import { followChannel } from "./followChannel";
import event from '../../lib/events';

const SESSION_SECRET = process.env.SESSION_SECRET;
const FRONT = process.env.FRONT;

export const getApi = (server: Express, passport: any, io: any) => {
  server.get('/api/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

  server.get('/api/auth/twitch/callback',
    passport.authenticate('twitch', {
      failureRedirect: FRONT
    }),
    (req, res: any) => {
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

  server.get('/api/getUser/:accessToken', (req: { params: { accessToken: any; }; }, res: { send: { (arg0: any): void; (arg0: { status: string; }): void; }; }) => {
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

  server.get('/api/getAllUsers/:secret', (req: { params: { secret: string | undefined; }; }, res: any) => {
    if (req.params.secret === SESSION_SECRET) {
      Users.find({ $or: [{ isPayed: true }, { isVip: true }] }).then((data: { length: any; map: (arg0: (w: any) => any) => void; }) => {
        if (data.length) {
          res.send({ users: data.map((w: { login: any; }) => w.login) });
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

  server.get('/api/getUserIsPayed/:user_link', async (req: any, res: any) => {
    const user_link = req.params.user_link

    if (!user_link) {
      res.send({ isPayed: false });
      return;
    }

    const user = await Users.findOne({ user_link, $or: [{ isPayed: true }, { isVip: true }] });

    if (!user) {
      res.send({ isPayed: false });
      return;
    }

    res.send({ isPayed: true });
  });

  const setPayment = async (req: any, res: any, amount: string, description: string) => {
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
    const OutSum = amount;
    const InvId = `${user.lastPaymentId}`;
    const Description = description;
    const pass1 = settings.roboPass1;
    const SignatureValue = md5(`${MerchantLogin}:${OutSum}:${InvId}:${pass1}`);
    res.redirect(`https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MerchantLogin}&Description=${Description}&OutSum=${OutSum}&InvoiceID=${InvId}&SignatureValue=${SignatureValue}`);
  }

  server.get('/api/payment/1', (req: any, res: any) => {
    setPayment(req, res, PaymentsPrices.One, PaymentsDescription.One);
  })

  server.get('/api/payment/2', (req: any, res: any) => {
    setPayment(req, res, PaymentsPrices.Three, PaymentsDescription.Three);
  })

  server.get('/api/payment/3', (req: any, res: any) => {
    setPayment(req, res, PaymentsPrices.Six, PaymentsDescription.Six);
  })

  server.get('/api/payment/callback', async (req: any, res: any) => {
    const settings = await Settings.findOne({ secret: SESSION_SECRET })

    if (!settings) {
      res.redirect(`${FRONT}`);
      return;
    }

    const { OutSum, InvId, SignatureValue } = req.query;
    const pass2 = settings.roboPass2;
    const signOne = md5(`${OutSum}:${InvId}:${pass2}`).toUpperCase();

    if (signOne !== SignatureValue) {
      res.send('Error');
      return;
    }
    
    const user = await Users.findOne({ lastPaymentId: InvId });

    if (!user) {
      res.redirect(`${FRONT}`);
      return;
    }

    const subscriptionEndDateMs: number = Date.now() + (PaymentsPricesValue[(Number(OutSum)).toString()] * 60 * 60 * 24 * 30 * 1000);

    Users.findOneAndUpdate({ lastPaymentId: InvId }, {
      isPayed: true,
      payedDate: createDate(),
      payedDateMs: Date.now(),
      subscriptionEndDateMs,
      lastPaymentId: settings.paymentsCount
    }).then(() => {
      Settings.findOneAndUpdate({ secret: SESSION_SECRET }, {
        paymentsCount: settings.paymentsCount + 1
      }).then(() => {
        if (!user.isFollowed) {
          followChannel(0, user.user_id);
        }
        event.emit('addChannel', user.login);
        io.emit(`isPayedNow-${user.user_link}`, 'Ok');
        res.send(`OK${InvId}`)
      });
    })
  })

  server.get('*', (req: any, res: any) => {
    return handle(req, res)
  })
}