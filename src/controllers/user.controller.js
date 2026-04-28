const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const checkUserExistsByPhone = catchAsync(async (req, res) => {
  const user = await userService.getUsersCollectionUserByPhone(req.query.phone);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this phone number');
  }
  res.status(httpStatus.OK).send({ exists: true, user });
});

const validateOtp = catchAsync(async (req, res) => {
  const { accessToken, expiresIn } = await userService.issueOtpAccessTokenByPhone(req.body.phone);
  res.status(httpStatus.OK).send({
    message: 'OTP validated successfully',
    accessToken,
    expiresIn,
  });
});

const setPasswordByPhone = catchAsync(async (req, res) => {
  await userService.setUsersCollectionPasswordByPhone(req.body.phone, req.body.accessToken, req.body.password);
  res.status(httpStatus.OK).send({ message: 'Password saved successfully' });
});

const signInByPhone = catchAsync(async (req, res) => {
  const { token, expiresIn } = await userService.signInUsersCollectionByPhone(req.body.phone, req.body.password);
  res.status(httpStatus.OK).send({
    message: 'Sign in successful',
    token,
    expiresIn,
  });
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getCollegeAdmins = catchAsync(async (req, res) => {
  const result = await userService.listCollegeAdmins();
  res.send(result);
});

const getUsersCollectionByRole = catchAsync(async (req, res) => {
  const result = await userService.listUsersCollectionByRole(req.query.role);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const updateUsersCollectionUser = catchAsync(async (req, res) => {
  const user = await userService.updateUsersCollectionUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getCollegeAdmins,
  getUsersCollectionByRole,
  getUser,
  updateUser,
  updateUsersCollectionUser,
  deleteUser,
  checkUserExistsByPhone,
  validateOtp,
  setPasswordByPhone,
  signInByPhone,
};
