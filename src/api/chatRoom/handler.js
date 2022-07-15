class ChatRoomHandler {
  constructor({
    controllers, validator, userControllers, messageControllers, rsaEncrypt, storageControllers,
  }) {
    this._controllers = controllers;
    this._validator = validator;
    this._userControllers = userControllers;
    this._messageControllers = messageControllers;
    this._rsaEncrypt = rsaEncrypt;
    this._storageControllers = storageControllers;

    this.createChatRoomHandler = this.createChatRoomHandler.bind(this);
    this.getAllRoomChatHandler = this.getAllRoomChatHandler.bind(this);
    this.getRoomByIdHandler = this.getRoomByIdHandler.bind(this);
    this.postMessageHandler = this.postMessageHandler.bind(this);
    this.postPictureMessageHanlder = this.postPictureMessageHanlder.bind(this);
  }

  async createChatRoomHandler(request, h) {
    await this._validator.validateChatRoomPayload(request.payload);

    const { username } = request.auth.credentials;
    const { participant } = request.payload;

    const verifyRoomChat = await this._controllers.verifyRoomChat(username, participant);

    if (verifyRoomChat) {
      return {
        status: 'success',
        message: 'room already created',
        data: {
          roomId: verifyRoomChat.id,
        },
      };
    }

    const roomId = await this._controllers.createRoomChat(username, participant);

    return h.response({
      status: 'success',
      message: 'successfully create chat room',
      data: {
        roomId,
      },
    }).code(201);
  }

  async getAllRoomChatHandler(request) {
    const { username } = request.auth.credentials;
    const rooms = await this._controllers.getAllRoom(username);

    const data = await Promise.all(rooms.map(async ({
      id, creator, participant_username: participant,
    }) => {
      const { profile_url: creatorProfileUrl } = await this._userControllers.getProfileUrl(creator);
      const {
        profile_url: participantProfileUrl,
      } = await this._userControllers.getProfileUrl(participant);
      const lastMessage = await this._messageControllers.getLastMessage(id);
      return {
        id,
        creator,
        creatorProfileUrl,
        participant,
        participantProfileUrl,
        lastMessage: lastMessage ? JSON.parse(this._rsaEncrypt.decrypt(lastMessage[0])) : null,
      };
    }));

    return {
      status: 'success',
      data,
    };
  }

  async getRoomByIdHandler(request) {
    const { roomId } = request.params;
    const {
      id,
      creator,
      participant_username: participant,
      created_at: createdAt,
    } = await this._controllers.getRoomById(roomId);

    const { profile_url: creatorProfileUrl } = await this._userControllers
      .getProfileUrl(creator);
    const { profile_url: participantProfileUrl } = await this._userControllers
      .getProfileUrl(participant);

    const encryptedMessages = await this._messageControllers.getAllMessage(roomId);
    const message = encryptedMessages.map((msg) => {
      const decrypt = this._rsaEncrypt.decrypt(msg);
      return JSON.parse(decrypt);
    });

    return {
      status: 'success',
      data: {
        id,
        creator,
        creatorProfileUrl,
        participant,
        participantProfileUrl,
        createdAt,
        message,
      },
    };
  }

  async postMessageHandler(request, h) {
    this._validator.validateMessagePayload(request.payload);
    const { username } = request.auth.credentials;
    const { roomId } = request.params;
    const { message, messageType } = request.payload;
    const timestamp = new Date().toISOString();
    const value = JSON.stringify({
      sender: username,
      message,
      messageType,
      timestamp,
    });
    const encryptedMessage = this._rsaEncrypt.encrypt(value);

    await this._messageControllers.postMessage(roomId, encryptedMessage);
    return h.response({
      status: 'success',
      message: 'successfully send message',
      data: {
        sender: username,
        message,
        messageType,
        timestamp,
      },
    }).code(201);
  }

  async postPictureMessageHanlder(request, h) {
    const { data } = request.payload;
    this._validator.validateImageMessagePayload(data.hapi.headers);
    const { username } = request.auth.credentials;
    const { roomId } = request.params;

    const fileUrl = await this._storageControllers.uploadMessagePhoto(data);
    const timestamp = new Date().toISOString();
    const value = JSON.stringify({
      sender: username,
      message: fileUrl,
      messageType: 'image',
      timestamp,
    });
    const encryptedMessage = this._rsaEncrypt.encrypt(value);
    await this._messageControllers.postMessage(roomId, encryptedMessage);

    return h.response({
      status: 'success',
      message: 'successfully send message',
      data: {
        sender: username,
        message: fileUrl,
        messageType: 'image',
        timestamp,
      },
    }).code(201);
  }
}

module.exports = ChatRoomHandler;
