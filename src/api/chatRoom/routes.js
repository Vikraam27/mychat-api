const routes = (handler) => [
  {
    method: 'POST',
    path: '/room',
    handler: handler.createChatRoomHandler,
    options: {
      auth: 'mychat_jwt',
    },
  },
  {
    method: 'GET',
    path: '/room',
    handler: handler.getAllRoomChatHandler,
    options: {
      auth: 'mychat_jwt',
    },
  },
  {
    method: 'GET',
    path: '/room/{roomId}',
    handler: handler.getRoomByIdHandler,
    options: {
      auth: 'mychat_jwt',
    },
  },
  {
    method: 'POST',
    path: '/room/{roomId}/message',
    handler: handler.postMessageHandler,
    options: {
      auth: 'mychat_jwt',
    },
  },
  {
    method: 'POST',
    path: '/room/{roomId}/message/image',
    handler: handler.postPictureMessageHanlder,
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
