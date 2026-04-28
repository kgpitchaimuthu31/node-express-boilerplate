const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { collegeService } = require('../services');

const createCollege = catchAsync(async (req, res) => {
  const college = await collegeService.createCollege(req.body);
  res.status(httpStatus.CREATED).send(college);
});

const getColleges = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['collegeId', 'annaUniversityId', 'name', 'contactMobile', 'isActive']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await collegeService.queryColleges(filter, options);
  res.send(result);
});

const getCollege = catchAsync(async (req, res) => {
  const college = await collegeService.getCollegeByCollegeId(req.params.collegeId);
  if (!college) {
    throw new ApiError(httpStatus.NOT_FOUND, 'College not found');
  }
  res.send(college);
});

const updateCollege = catchAsync(async (req, res) => {
  const college = await collegeService.updateCollegeByCollegeId(req.params.collegeId, req.body);
  res.send(college);
});

const deleteCollege = catchAsync(async (req, res) => {
  await collegeService.deleteCollegeByCollegeId(req.params.collegeId);
  res.status(httpStatus.NO_CONTENT).send();
});

const createCollegeAdmin = catchAsync(async (req, res) => {
  const result = await collegeService.createCollegeAdminByCollegeId(req.params.collegeId, req.body);
  res.status(httpStatus.CREATED).send(result);
});

module.exports = {
  createCollege,
  getColleges,
  getCollege,
  updateCollege,
  deleteCollege,
  createCollegeAdmin,
};
