require('dotenv').config();

const event = require('../../lib/events');
const getClient = require('./clientHandler');
const axios = require('axios');

setTimeout(() => {
  axios.get(`${process.env.BACK}/api/getAllUsers/${process.env.SESSION_SECRET}`).then(data => {
    let channels = data.data.map(w => getClient(w));
    event.on('addChannel', _channel => channels.push(getClient(_channel)));
  });
}, 10000)
