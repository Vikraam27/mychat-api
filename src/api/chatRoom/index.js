const ChatRoomHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'chat-room',
  version: '1.0.0',
  register: async (server, {
    controllers, validator, userControllers, messageControllers, rsaEncrypt, storageControllers,
  }) => {
    const chatRoomHandler = new ChatRoomHandler({
      controllers, validator, userControllers, messageControllers, rsaEncrypt, storageControllers,
    });
    server.route(routes(chatRoomHandler));
  },
};
