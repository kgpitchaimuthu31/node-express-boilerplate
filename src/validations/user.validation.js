const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCollegeAdmins = {
  query: Joi.object().keys({}),
};

const getUsersCollectionByRole = {
  query: Joi.object().keys({
    role: Joi.string().required().valid('college_admin', 'student'),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1),
};

const updateUsersCollectionUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      phone_number: Joi.string()
        .trim()
        .pattern(/^[0-9]{10}$/)
        .messages({ 'string.pattern.base': 'phone_number must be a 10-digit mobile number' }),
      email: Joi.string().trim().email(),
      is_active: Joi.boolean(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const checkExistsByPhone = {
  query: Joi.object().keys({
    phone: Joi.string()
      .trim()
      .required()
      .pattern(/^[0-9]{10}$/)
      .messages({ 'string.pattern.base': 'phone must be a 10-digit mobile number' }),
  }),
};

const validateOtp = {
  body: Joi.object().keys({
    phone: Joi.string()
      .trim()
      .required()
      .pattern(/^[0-9]{10}$/)
      .messages({ 'string.pattern.base': 'phone must be a 10-digit mobile number' }),
    otp: Joi.string()
      .trim()
      .required()
      .pattern(/^[0-9]{6}$/)
      .messages({ 'string.pattern.base': 'otp must be a 6-digit numeric value' }),
  }),
};

const setPasswordByPhone = {
  body: Joi.object().keys({
    phone: Joi.string()
      .trim()
      .required()
      .pattern(/^[0-9]{10}$/)
      .messages({ 'string.pattern.base': 'phone must be a 10-digit mobile number' }),
    accessToken: Joi.string().trim().required(),
    password: Joi.string().required().custom(password),
  }),
};

const signInByPhone = {
  body: Joi.object().keys({
    phone: Joi.string()
      .trim()
      .required()
      .pattern(/^[0-9]{10}$/)
      .messages({ 'string.pattern.base': 'phone must be a 10-digit mobile number' }),
    password: Joi.string().required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getCollegeAdmins,
  getUsersCollectionByRole,
  getUser,
  updateUser,
  updateUsersCollectionUser,
  deleteUser,
  checkExistsByPhone,
  validateOtp,
  setPasswordByPhone,
  signInByPhone,
};
