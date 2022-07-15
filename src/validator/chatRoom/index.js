const InvariantError = require('../../exceptions/InvariantError');
const { ChatRoomModels, MessageModels, ImageHeadersModels } = require('./models');

const ChatRoomValidator = {
  validateChatRoomPayload: (payload) => {
    const validationResult = ChatRoomModels.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateMessagePayload: (payload) => {
    const validationResult = MessageModels.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateImageMessagePayload: (payload) => {
    const validationResult = ImageHeadersModels.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ChatRoomValidator;
