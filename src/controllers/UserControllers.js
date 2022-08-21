const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { hash, compare } = require('bcrypt');

const InvariantError = require('../exceptions/InvariantError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const NotFoundError = require('../exceptions/NotFoundError');

class UserControllers {
  constructor() {
    this._pool = new Pool();
  }

  async registerUser({
    email, username, password, createdAt,
  }) {
    const userId = `user-${nanoid(10)}`;
    const hashPassword = await hash(password, 10);
    const isEmailVerified = false;

    const query = {
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [userId, email, username, hashPassword, isEmailVerified, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw InvariantError('Fail to register user');
    }
    return result.rows[0].id;
  }

  async addUserProfile({
    userId, username, fullname, email, gender, status, createdAt,
  }) {
    const query = {
      text: `INSERT INTO user_profile
      (user_id, username, fullname, user_email, gender, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id`,
      values: [userId, username, fullname, email, gender, status, createdAt, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw InvariantError('Fail to register user');
    }
  }

  async addOtpToken(otp, data) {
    const query = {
      text: 'INSERT INTO otp VALUES ($1, $2)',
      values: [otp, data],
    };

    await this._pool.query(query);
  }

  async verifyOtp(otp, token) {
    const query = {
      text: 'SELECT timestamp FROM otp WHERE token = $1 AND otp_num = $2',
      values: [token, otp],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('otp expired');
    }

    const { timestamp } = result.rows[0];
    const dateNow = Date.now();
    const otpTimestamp = new Date(timestamp);

    if ((dateNow - otpTimestamp) >= 5 * 60 * 1000) {
      throw new InvariantError('otp expired');
    }

    return result.rows[0];
  }

  async verifiedUserEmail(userId) {
    const query = {
      text: 'UPDATE users SET is_email_verified = true WHERE id = $1',
      values: [userId],
    };

    await this._pool.query(query);
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, email, username, is_email_verified, password FROM users WHERE email = $1',
      values: [email],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError('Invalid username');
    }

    const {
      id, email: userMail, username, password: hashedPassword, is_email_verified: isEmailVerified,
    } = result.rows[0];

    const match = await compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Invalid password');
    }

    return {
      id, username, userMail, isEmailVerified,
    };
  }

  async verifyUsername(username) {
    const query = {
      text: 'SELECT username FROM user_profile WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Username already taken');
    }
  }

  async verifyEmail(email) {
    const query = {
      text: 'SELECT user_email FROM user_profile WHERE user_email = $1',
      values: [email],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('email already taken');
    }
  }

  async updateUserProfilePicture(userId, profileUrl) {
    const query = {
      text: 'UPDATE user_profile SET profile_url = $1 WHERE user_id = $2 RETURNING profile_url',
      values: [profileUrl, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount > 0) {
      throw new InvariantError('fail to update profile picture');
    }
  }

  async getUserProfile(userId) {
    const query = {
      text: 'SELECT * FROM user_profile WHERE user_id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('user not found');
    }

    return result.rows[0];
  }

  async updateUserProfile(userId, fullname, gender, status) {
    const query = {
      text: 'UPDATE user_profile SET fullname = $1, gender = $2, status = $3 WHERE user_id = $4',
      values: [fullname, gender, status, userId],
    };

    await this._pool.query(query);
  }

  async getProfileUrl(username) {
    const query = {
      text: 'SELECT profile_url FROM user_profile WHERE username = $1',
      values: [username],
    };

    const { rows } = await this._pool.query(query);
    console.log(rows);

    return rows[0];
  }

  async searchUserByUsername(q) {
    const query = {
      text: `SELECT users.username, user_profile.profile_url, user_profile.profile_url, user_profile.status
      FROM users JOIN user_profile ON users.username = user_profile.username
      WHERE LOWER(users.username) LIKE $1 AND users.is_email_verified = true LIMIT 10;
      `,
      values: [`%${q}%`],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }
}

module.exports = UserControllers;
