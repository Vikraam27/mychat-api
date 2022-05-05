require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

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

// exception
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const userControllers = new UserControllers();
  const mailSender = new MailSender();
  const authenticationsControllers = new AuthenticationsControllers();

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
  ]);

  // jwt proctected routes
  server.auth.strategy('chat_app', 'jwt', {
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

  await server.start();
  console.log(`server running on ${server.info.uri}`);
};

init();
