import { Users } from '../../models/users';
import { CharsStats } from '../charsStats';

const UPDATE_STATS_INTERVAL = 1000 * 60 * 10;

export const startUpdateStats = () => setInterval(() => {
  const stats = CharsStats.getStats();

  if (!stats.length) return;

  stats.forEach(user => {
    Users.updateOne({
      login: user.login
    }, {
      $inc: {
        stats: user.count
      }
    }).then(() => {
      CharsStats.clearStat(user.login);
    })
  })

}, UPDATE_STATS_INTERVAL);
