const routes = (handler) => [
  {
    method: 'POST',
    path: '/auth',
    handler: handler.postAuthenticationHandler,
  },
];

module.exports = routes;
