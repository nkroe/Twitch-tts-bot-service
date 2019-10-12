require('dotenv').config();

const event = require('./events');
const getClient = require('./clientHandler');
const axios = require('axios');

axios.get(`${process.env.BACK}/api/getAllUsers`).then(data => {
  let channels = data.data.map(w => getClient(w));
  event.on('addChannel', _channel => channels.push(getClient(_channel)));
})

