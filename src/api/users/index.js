const UserHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server, { controllers, validator, mailSender }) => {
    const userHandler = new UserHandler(controllers, validator, mailSender);
    server.route(routes(userHandler));
  },
};
