const Joi = require('joi');

const ChatRoomModels = Joi.object({
  participant: Joi.string().required(),
});

const MessageModels = Joi.object({
  message: Joi.string().required(),
  messageType: Joi.string().required(),
});

const ImageHeadersModels = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(),
}).unknown();

const DocumentHeadersModels = Joi.object({
  'content-type': Joi.string().valid('application/pdf').required(),
}).unknown();

module.exports = {
  ChatRoomModels,
  MessageModels,
  ImageHeadersModels,
  DocumentHeadersModels,
};
