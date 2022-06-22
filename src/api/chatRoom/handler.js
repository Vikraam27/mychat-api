class ChatRoomHandler {
  constructor({ controllers, validator, userControllers }) {
    this._controllers = controllers;
    this._validator = validator;
    this._userControllers = userControllers;

    this.createChatRoomHandler = this.createChatRoomHandler.bind(this);
    this.getAllRoomChatHandler = this.getAllRoomChatHandler.bind(this);
    this.getRoomByIdHandler = this.getRoomByIdHandler.bind(this);
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

      return {
        id,
        creator,
        creatorProfileUrl,
        participant,
        participantProfileUrl,
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

    return {
      status: 'success',
      data: {
        id,
        creator,
        creatorProfileUrl,
        participant,
        participantProfileUrl,
        createdAt,
      },
    };
  }
}

module.exports = ChatRoomHandler;
