import { Users } from "../../models/users";

const TIMEOUT = 60 * 60 * 1000;

export const checkSubscriptionEnd = () => setInterval(async () => {
  const usersWithEndedSubscription = await Users.find(
    { subscriptionEndDateMs: { $lt: Date.now() } },
    { user_id: 1 }
  );

  if (usersWithEndedSubscription.length === 0) return;

  usersWithEndedSubscription.forEach(user => {
    Users.updateOne({
      user_id: user.user_id
    }, {
      $set: {
        isPayed: false
      },
      $unset: {
        payedDate: "",
        payedDateMs: 1,
        subscriptionEndDateMs: 1
      }
    }).then(() => '')
  })
}, TIMEOUT);
