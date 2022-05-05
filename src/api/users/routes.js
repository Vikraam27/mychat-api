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
];

module.exports = routes;
