const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Department, College } = require('../models');
const ApiError = require('../utils/ApiError');

const normalizeCode = (code) =>
  String(code || '')
    .trim()
    .toUpperCase();

const ensureCollegeExistsByCollegeId = async (collegeIdStr) => {
  const college = await College.findOne({ collegeId: collegeIdStr.trim() });
  if (!college) {
    throw new ApiError(httpStatus.NOT_FOUND, 'College not found');
  }
  return college;
};

const createDepartment = async (collegeIdStr, body) => {
  await ensureCollegeExistsByCollegeId(collegeIdStr);
  const code = normalizeCode(body.code);
  const name = String(body.name || '').trim();
  if (!name) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Department name is required');
  }
  if (!code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Department code is required');
  }

  try {
    return await Department.create({
      collegeId: collegeIdStr.trim(),
      code,
      name,
      description: body.description != null ? String(body.description).trim() : '',
      isActive: body.isActive !== false,
      updatedAt: new Date(),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      throw new ApiError(httpStatus.CONFLICT, 'Department code already exists for this college');
    }
    throw error;
  }
};

const listDepartmentsByCollege = async (collegeIdStr) => {
  return Department.find({ collegeId: collegeIdStr.trim() }).sort({ name: 1 });
};

const getDepartmentInCollege = async (collegeIdStr, departmentId) => {
  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid department id');
  }
  const department = await Department.findOne({
    _id: departmentId,
    collegeId: collegeIdStr.trim(),
  });
  return department;
};

const updateDepartment = async (collegeIdStr, departmentId, updateBody) => {
  const department = await getDepartmentInCollege(collegeIdStr, departmentId);
  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
  }

  if (updateBody.name != null) {
    department.name = String(updateBody.name).trim();
  }
  if (updateBody.code != null) {
    department.code = normalizeCode(updateBody.code);
  }
  if (updateBody.description != null) {
    department.description = String(updateBody.description).trim();
  }
  if (updateBody.isActive != null) {
    department.isActive = Boolean(updateBody.isActive);
  }

  department.updatedAt = new Date();
  try {
    await department.save();
  } catch (error) {
    if (error && error.code === 11000) {
      throw new ApiError(httpStatus.CONFLICT, 'Department code already exists for this college');
    }
    throw error;
  }
  return department;
};

const deleteDepartment = async (collegeIdStr, departmentId) => {
  const department = await getDepartmentInCollege(collegeIdStr, departmentId);
  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
  }
  await department.deleteOne();
};

module.exports = {
  createDepartment,
  listDepartmentsByCollege,
  getDepartmentInCollege,
  updateDepartment,
  deleteDepartment,
};
