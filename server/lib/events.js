const Events = require('events');

const event = new Events();
event.setMaxListeners(0);

module.exports = event;