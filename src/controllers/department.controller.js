const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { departmentService } = require('../services');

const createDepartment = catchAsync(async (req, res) => {
  const department = await departmentService.createDepartment(req.params.collegeId, req.body);
  res.status(httpStatus.CREATED).send(department);
});

const listDepartments = catchAsync(async (req, res) => {
  const departments = await departmentService.listDepartmentsByCollege(req.params.collegeId);
  res.send(departments);
});

const getDepartment = catchAsync(async (req, res) => {
  const department = await departmentService.getDepartmentInCollege(req.params.collegeId, req.params.departmentId);
  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
  }
  res.send(department);
});

const updateDepartment = catchAsync(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.collegeId, req.params.departmentId, req.body);
  res.send(department);
});

const deleteDepartment = catchAsync(async (req, res) => {
  await departmentService.deleteDepartment(req.params.collegeId, req.params.departmentId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
