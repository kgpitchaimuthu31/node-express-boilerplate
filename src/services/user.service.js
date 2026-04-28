const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User, UsersCollection, College, UserProfile } = require('../models');
const logger = require('../config/logger');

const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * List users from users collection with role college_admin
 * @returns {Promise<Array>}
 */
const listCollegeAdmins = async () => {
  return UsersCollection.find({ role: { $in: ['college_admin', 'dept_admin'] } })
    .select('name phone_number email role is_active created_at last_login_at')
    .sort({ created_at: -1 });
};

/**
 * List users from users collection by role
 * @param {string} role
 * @returns {Promise<Array>}
 */
const listUsersCollectionByRole = async (role) => {
  return UsersCollection.find({ role })
    .select('name phone_number email role is_active created_at last_login_at')
    .sort({ created_at: -1 });
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const updateUsersCollectionUserById = async (userId, updateBody) => {
  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (updateBody.phone_number) {
    const normalizedPhone = String(updateBody.phone_number).trim();
    const existingByPhone = await UsersCollection.findOne({
      phone_number: normalizedPhone,
      _id: { $ne: userId },
    });
    if (existingByPhone) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already exists');
    }
    user.phone_number = normalizedPhone;
  }

  if (updateBody.email) {
    const normalizedEmail = String(updateBody.email).trim().toLowerCase();
    const existingByEmail = await UsersCollection.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });
    if (existingByEmail) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
    }
    user.email = normalizedEmail;
  }

  if (updateBody.name !== undefined) {
    user.name = String(updateBody.name || '').trim();
  }

  if (typeof updateBody.is_active === 'boolean') {
    user.is_active = updateBody.is_active;
  }

  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const getUsersCollectionUserByPhone = async (phone) => {
  const normalized = String(phone).trim();

  let user = await UsersCollection.findOne({ phone_number: normalized });
  if (!user && /^\d+$/.test(normalized)) {
    user = await UsersCollection.findOne({ phone_number: Number(normalized) });
    if (user) {
      logger.debug('[users] match found using numeric phone_number (DB stores number, not string)');
    }
  }

  return user;
};

const issueOtpAccessTokenByPhone = async (phone) => {
  const normalized = String(phone).trim();
  let user = await getUsersCollectionUserByPhone(normalized);

  // For new signups, create a user row on successful OTP validation.
  if (!user) {
    user = await UsersCollection.create({
      phone_number: normalized,
      role: 'student',
      is_active: true,
      created_at: new Date(),
    });
  }

  // Short-lived token (120 seconds).
  const accessToken = crypto.randomBytes(12).toString('hex');
  const expiresAt = new Date(Date.now() + 120 * 1000);

  user.access_token = accessToken;
  user.access_token_expires_at = expiresAt;
  await user.save();

  // Best-effort cleanup after 120 seconds.
  setTimeout(async () => {
    try {
      await UsersCollection.updateOne(
        { _id: user._id, access_token: accessToken },
        { $unset: { access_token: 1, access_token_expires_at: 1 } }
      );
    } catch (error) {
      logger.error(`Failed to cleanup expired access_token for user ${user._id}: ${error.message}`);
    }
  }, 120 * 1000);

  return {
    accessToken,
    expiresIn: 120,
  };
};

const setUsersCollectionPasswordByPhone = async (phone, accessToken, plainPassword) => {
  const user = await getUsersCollectionUserByPhone(phone);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this phone number');
  }

  if (!user.access_token || !user.access_token_expires_at) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Your verification session has expired. Please request and validate OTP again.'
    );
  }

  if (user.access_token !== accessToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid access token. Please validate OTP again.');
  }

  if (new Date(user.access_token_expires_at).getTime() < Date.now()) {
    user.access_token = undefined;
    user.access_token_expires_at = undefined;
    await user.save();
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Access token expired. Please validate OTP again.');
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 8);
  user.password_hash = hashedPassword;
  user.access_token = undefined;
  user.access_token_expires_at = undefined;
  await user.save();

  return user;
};

const signInUsersCollectionByPhone = async (phone, plainPassword) => {
  const user = await getUsersCollectionUserByPhone(phone);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this phone number');
  }

  const currentPasswordHash = user.password_hash || user.pw;
  if (!currentPasswordHash) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is not set for this account');
  }

  if (user.is_active === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'This account is inactive');
  }

  const normalizedPassword = String(plainPassword);
  // bcrypt.compare hashes the plain input internally using the stored hash salt.
  const isPasswordMatch = await bcrypt.compare(normalizedPassword, currentPasswordHash);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password');
  }

  let scopedCollegeId = null;
  try {
    const profile = await UserProfile.findOne({ userId: user._id });
    if (profile && profile.collegeId) {
      const collegeDoc = await College.findById(profile.collegeId).select('collegeId');
      if (collegeDoc && collegeDoc.collegeId) {
        scopedCollegeId = collegeDoc.collegeId;
      }
    }
  } catch (_error) {
    scopedCollegeId = null;
  }

  const tokenPayload = {
    sub: user._id.toString(),
    phone: user.phone_number,
    role: user.role,
    ...(scopedCollegeId ? { collegeId: scopedCollegeId } : {}),
  };

  const token = jwt.sign(tokenPayload, config.jwt.secret, { expiresIn: '2d' });

  user.jwt = token;
  user.last_login_at = new Date();
  await user.save();

  return {
    token,
    expiresIn: 2 * 24 * 60 * 60,
  };
};

module.exports = {
  createUser,
  queryUsers,
  listCollegeAdmins,
  listUsersCollectionByRole,
  getUserById,
  getUserByEmail,
  updateUserById,
  updateUsersCollectionUserById,
  deleteUserById,
  getUsersCollectionUserByPhone,
  issueOtpAccessTokenByPhone,
  setUsersCollectionPasswordByPhone,
  signInUsersCollectionByPhone,
};
