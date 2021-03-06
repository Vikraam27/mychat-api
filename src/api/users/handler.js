const { encrypt, decrypt } = require('../../RSA_encryption/Rsa');

class UserHandler {
  constructor(controllers, validator, mailSender) {
    this._validator = validator;
    this._controllers = controllers;
    this._mailSender = mailSender;

    this.registerUserHandler = this.registerUserHandler.bind(this);
    this.requestOtpHandler = this.requestOtpHandler.bind(this);
    this.verifyOtpHanlder = this.verifyOtpHanlder.bind(this);
    this.getProfileHandler = this.getProfileHandler.bind(this);
    this.UpdateProfileHandler = this.UpdateProfileHandler.bind(this);
    this.searchUserByUsernameHanlder = this.searchUserByUsernameHanlder.bind(this);
  }

  async registerUserHandler(request, h) {
    await this._validator.validateUserRegisterModel(request.payload);

    const {
      username, fullname, email, gender, status, password,
    } = request.payload;
    await this._controllers.verifyEmail(email);
    await this._controllers.verifyUsername(username);
    const createdAt = new Date().toISOString();

    const userId = await this._controllers.registerUser({
      email, username, password, createdAt,
    });
    await this._controllers.addUserProfile({
      userId, username, fullname, email, gender, status, createdAt,
    });
    const hash = encrypt({
      id: userId,
      username,
      email,
    });

    const response = h.response({
      status: 'success',
      message: 'successfully registered user, please verify email to log in',
      statusCode: 201,
      data: {
        userId,
        token: hash,
      },
    });
    response.code(201);
    return response;
  }

  async requestOtpHandler(request) {
    await this._validator.validateRequestOtp(request.payload);

    const { token } = request.payload;

    const { username, email } = JSON.parse(decrypt(token));
    const otp = Math.floor(100000 + Math.random() * 900000);
    const partialEmail = email.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, '$1***@$2');

    await this._controllers.addOtpToken(otp, token);
    await this._mailSender.sendEmail(email, username, otp);

    return {
      status: 'success',
      message: `successfully send otp to ${partialEmail}`,
    };
  }

  async verifyOtpHanlder(request) {
    await this._validator.validateVerifyOtp(request.payload);

    const { otp, token } = request.payload;
    const { id } = JSON.parse(decrypt(token));

    await this._controllers.verifyOtp(otp, token);
    await this._controllers.verifiedUserEmail(id);

    return {
      status: 'success',
      message: 'successfully verified email',
    };
  }

  async getProfileHandler(request) {
    const { id } = request.auth.credentials;
    const data = await this._controllers.getUserProfile(id);

    return {
      status: 'success',
      message: 'successfully get user information',
      data: {
        userId: data.user_id,
        username: data.username,
        fullname: data.fullname,
        email: data.user_email,
        profileUrl: data.profile_url,
        gender: data.gender,
        status: data.status,
      },
    };
  }

  async UpdateProfileHandler(request) {
    const { id } = request.auth.credentials;
    await this._validator.validateUpdateProfileModels(request.payload);

    const { fullname, gender, status } = request.payload;
    await this._controllers.updateUserProfile(id, fullname, gender, status);

    return {
      status: 'success',
      message: 'successfully update user information',
    };
  }

  async searchUserByUsernameHanlder(request) {
    const { q } = request.query;
    const data = await this._controllers.searchUserByUsername(q);

    return {
      status: 'success',
      data,
    };
  }
}

module.exports = UserHandler;
