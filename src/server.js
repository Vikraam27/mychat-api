/* eslint-disable global-require */
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const innert = require('@hapi/inert');
// user
const users = require('./api/users');
const UserControllers = require('./controllers/UserControllers');
const UserValidator = require('./validator/users');
const MailSender = require('./controllers/nodemailer/MailSender');

// authentication
const authentications = require('./api/authentications');
const AuthenticationsControllers = require('./controllers/AuthenticationsControllers');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// uploads
const uploads = require('./api/uploads');
const StorageControllers = require('./controllers/storage/StorageControllers');
const UploadsValidator = require('./validator/uploads');

// chat room
const chatRoom = require('./api/chatRoom');
const ChatRoomControllers = require('./controllers/ChatRoomControllers');
const ChatRoomValidator = require('./validator/chatRoom');
const MessageControllers = require('./controllers/redis/MessageControllers');
const rsaEncrypt = require('./RSA_encryption/Rsa');

// exception
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const userControllers = new UserControllers();
  const mailSender = new MailSender();
  const authenticationsControllers = new AuthenticationsControllers();
  const storageControllers = new StorageControllers();
  const chatRoomControllers = new ChatRoomControllers();
  const messageControllers = new MessageControllers();

  const server = Hapi.server({
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // register external plugin
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: innert,
    },
  ]);

  // jwt proctected routes
  server.auth.strategy('mychat_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
        username: artifacts.decoded.payload.username,
        email: artifacts.decoded.payload.email,
      },
    }),
  });

  // register plugin
  await server.register([
    {
      plugin: users,
      options: {
        controllers: userControllers,
        validator: UserValidator,
        mailSender,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsControllers,
        userControllers,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        controllers: storageControllers,
        validator: UploadsValidator,
        userControllers,
      },
    },
    {
      plugin: chatRoom,
      options: {
        controllers: chatRoomControllers,
        validator: ChatRoomValidator,
        userControllers,
        messageControllers,
        rsaEncrypt,
        storageControllers,
      },
    },
  ]);

  // handling client error and server error
  await server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const ClientErrorResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      ClientErrorResponse.code(response.statusCode);
      return ClientErrorResponse;
    }

    const serverError = h.response({
      status: 'error',
      statusCode: 500,
      message: 'Server Error',
    });
    serverError.code(500);
    return response.continue || response;
  });

  const io = require('socket.io')(server.listener, {
    cors: {
      origin: server.info.uri,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('joinRoom', ({ roomid }) => {
      socket.join(roomid);
    });

    socket.on('chatMsg', ({
      roomId, sender, message, messageType, timestamp,
    }) => {
      io.to(roomId).emit('msg', ({
        sender, message, messageType, timestamp,
      }));
    });

    socket.on('disconnect', () => {
      console.log('disconect');
    });
  });

  await server.start();
  console.log(`server running on ${server.info.uri}`);
};

init();
