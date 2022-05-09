const { encrypt } = require('../../RSA_encryption/Rsa');

class AuthenticationsHandler {
  constructor(authenticationsControllers, userControllers, tokenManager, validator) {
    this._authenticationsControllers = authenticationsControllers;
    this._userControllers = userControllers;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationsPayload(request.payload);
    const { email, password } = request.payload;

    const {
      id, username, userMail, isEmailVerified,
    } = await this._userControllers.verifyUserCredential(email, password);

    if (isEmailVerified === false) {
      const token = encrypt({
        id,
        username,
        email: userMail,
      });

      const response = h.response({
        status: 'success',
        message: 'please verify your email address',
        data: {
          token,
        },
      });
      return response;
    }

    const accessToken = this._tokenManager.generateAccessToken({
      id,
      username,
      email: userMail,
    });

    const refreshToken = this._tokenManager.generateRefreshToken({
      id,
      username,
      email: userMail,
    });
    await this._authenticationsControllers.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Successfully log-in',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    this._validator.validatePutAuthenticationsPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authenticationsControllers.verifyRefreshToken(refreshToken);

    const { id, username, email } = this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = this._tokenManager.generateAccessToken({ id, username, email });

    return {
      status: 'success',
      statusCode: 200,
      message: 'successfully update the token',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    this._validator.validateDeleteAuthenticationsPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsControllers.verifyRefreshToken(refreshToken);
    await this._authenticationsControllers.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      statusCode: 200,
      message: 'successfully deleted refresh token',
    };
  }
}

module.exports = AuthenticationsHandler;
