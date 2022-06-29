const ChatRoomHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'chat-room',
  version: '1.0.0',
  register: async (server, {
    controllers, validator, userControllers, messageControllers, rsaEncrypt,
  }) => {
    const chatRoomHandler = new ChatRoomHandler({
      controllers, validator, userControllers, messageControllers, rsaEncrypt,
    });
    server.route(routes(chatRoomHandler));
  },
};
