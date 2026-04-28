const httpStatus = require('http-status');
const { College, Department, UsersCollection, UserProfile } = require('../models');
const ApiError = require('../utils/ApiError');

const createCollege = async (collegeBody) => {
  const existing = await College.findOne({ collegeId: collegeBody.collegeId.trim() });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'College ID already exists');
  }

  return College.create({
    ...collegeBody,
    collegeId: collegeBody.collegeId.trim(),
    updatedAt: new Date(),
  });
};

const queryColleges = async (filter, options) => {
  return College.paginate(filter, options);
};

const getCollegeByCollegeId = async (collegeId) => {
  return College.findOne({ collegeId: collegeId.trim() });
};

const updateCollegeByCollegeId = async (collegeId, updateBody) => {
  const college = await getCollegeByCollegeId(collegeId);
  if (!college) {
    throw new ApiError(httpStatus.NOT_FOUND, 'College not found');
  }

  if (updateBody.collegeId && updateBody.collegeId !== college.collegeId) {
    const duplicateCollege = await getCollegeByCollegeId(updateBody.collegeId);
    if (duplicateCollege) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'College ID already exists');
    }
  }

  Object.assign(college, updateBody, { updatedAt: new Date() });
  await college.save();
  return college;
};

const deleteCollegeByCollegeId = async (collegeId) => {
  const college = await getCollegeByCollegeId(collegeId);
  if (!college) {
    throw new ApiError(httpStatus.NOT_FOUND, 'College not found');
  }

  await college.deleteOne();
  return college;
};

const splitName = (fullName) => {
  const normalized = String(fullName || '').trim();
  if (!normalized) {
    return { firstName: '', lastName: '' };
  }

  const parts = normalized.split(/\s+/);
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ');
  return { firstName, lastName };
};

const createCollegeAdminByCollegeId = async (collegeId, adminBody) => {
  const college = await getCollegeByCollegeId(collegeId);
  if (!college) {
    throw new ApiError(httpStatus.NOT_FOUND, 'College not found');
  }

  const normalizedPhone = String(adminBody.phone_number || '').trim();
  const normalizedEmail = String(adminBody.email || '')
    .trim()
    .toLowerCase();
  const normalizedName = String(adminBody.name || adminBody.Name || '').trim();
  const normalizedDepartmentId = String(adminBody.departmentId || '').trim();
  const { firstName, lastName } = splitName(normalizedName);

  const existingByPhone = await UsersCollection.findOne({ phone_number: normalizedPhone });
  if (existingByPhone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already exists');
  }

  const existingByEmail = await UsersCollection.findOne({ email: normalizedEmail });
  if (existingByEmail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }

  let department = null;
  if (normalizedDepartmentId) {
    department = await Department.findById(normalizedDepartmentId);
    if (!department || String(department.collegeId) !== String(college._id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid department for selected college');
    }
  }

  const user = await UsersCollection.create({
    phone_number: normalizedPhone,
    email: normalizedEmail,
    name: normalizedName,
    role: department ? 'dept_admin' : 'college_admin',
    is_active: true,
    created_at: new Date(),
  });

  const userProfile = await UserProfile.create({
    userId: user._id,
    collegeId: college._id,
    departmentId: department ? department._id : undefined,
    first_name: firstName,
    last_name: lastName,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return { user, userProfile };
};

module.exports = {
  createCollege,
  queryColleges,
  getCollegeByCollegeId,
  updateCollegeByCollegeId,
  deleteCollegeByCollegeId,
  createCollegeAdminByCollegeId,
};
