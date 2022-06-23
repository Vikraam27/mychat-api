const routes = (handler) => [
  {
    method: 'POST',
    path: '/register',
    handler: handler.registerUserHandler,
  },
  {
    method: 'POST',
    path: '/req-otp',
    handler: handler.requestOtpHandler,
  },
  {
    method: 'POST',
    path: '/verifyotp',
    handler: handler.verifyOtpHanlder,
  },
  {
    method: 'GET',
    path: '/profile',
    handler: handler.getProfileHandler,
    options: {
      auth: 'mychat_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/profile',
    handler: handler.UpdateProfileHandler,
    options: {
      auth: 'mychat_jwt',
    },
  },
  {
    method: 'GET',
    path: '/search-user',
    handler: handler.searchUserByUsernameHanlder,
    options: {
      auth: 'mychat_jwt',
    },
  },
];

module.exports = routes;
