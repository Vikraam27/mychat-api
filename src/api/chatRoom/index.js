const ChatRoomHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'chat-room',
  version: '1.0.0',
  register: async (server, {
    controllers, validator, userControllers,
  }) => {
    const chatRoomHandler = new ChatRoomHandler({
      controllers, validator, userControllers,
    });
    server.route(routes(chatRoomHandler));
  },
};
