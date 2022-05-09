const routes = (handler) => [
  {
    method: 'POST',
    path: '/upload-profile-pict',
    handler: handler.updateProfileImgHandler,
    options: {
      auth: 'mychat_jwt',
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    },
  },
];

module.exports = routes;
