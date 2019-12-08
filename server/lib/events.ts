import Events from 'events';

const event = new Events();
event.setMaxListeners(0);

export default event;