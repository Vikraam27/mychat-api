class UploadsHandler {
  constructor(controllers, validator, userControllers) {
    this._controlles = controllers;
    this._validator = validator;
    this._userControllers = userControllers;

    this.updateProfileImgHandler = this.updateProfileImgHandler.bind(this);
  }

  async updateProfileImgHandler(request) {
    const { id } = request.auth.credentials;
    const { data } = request.payload;
    this._validator.validateImageHeaders(data.hapi.headers);

    const fileUrl = await this._controlles.uploadProfilePhoto(data);
    await this._userControllers.updateUserProfilePicture(id, fileUrl);

    return {
      status: 'success',
      message: 'successfully upload image and update profile picture',
      data: {
        fileUrl,
      },
    };
  }
}

module.exports = UploadsHandler;
