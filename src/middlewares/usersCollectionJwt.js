const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const config = require('../config/config');
const { UsersCollection } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Bearer JWT issued by users/sign-in (UsersCollection).
 */
const usersCollectionJwt = () => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const userId = decoded.sub;
    const user = await UsersCollection.findById(userId);
    if (!user || user.is_active === false) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    req.usersCollectionUser = user;
    req.usersCollectionJwtPayload = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
};

module.exports = usersCollectionJwt;
