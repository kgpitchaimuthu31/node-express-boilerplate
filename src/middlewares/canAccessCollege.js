const httpStatus = require('http-status');
const { UserProfile, College } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Requires req.usersCollectionUser (usersCollectionJwt).
 * super_admin: any college; college_admin: only own college (via user_profiles).
 */
const canAccessCollege = () => async (req, res, next) => {
  try {
    const user = req.usersCollectionUser;
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const collegeIdParam = req.params.collegeId != null ? String(req.params.collegeId).trim() : '';
    if (!collegeIdParam) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'College ID is required');
    }

    if (user.role === 'super_admin') {
      next();
      return;
    }

    if (user.role === 'college_admin') {
      const profile = await UserProfile.findOne({ userId: user._id });
      if (!profile || !profile.collegeId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'No college is linked to this account');
      }
      const college = await College.findById(profile.collegeId);
      if (!college || college.collegeId.trim() !== collegeIdParam) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }
      next();
      return;
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  } catch (error) {
    next(error);
  }
};

module.exports = canAccessCollege;
