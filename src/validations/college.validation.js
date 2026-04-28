const Joi = require('joi');

const createCollege = {
  body: Joi.object().keys({
    collegeId: Joi.string().trim().required(),
    annaUniversityId: Joi.string().trim().allow('', null),
    name: Joi.string().trim().required(),
    logoUrl: Joi.string().trim().uri().allow('', null),
    contactMobile: Joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/)
      .messages({ 'string.pattern.base': 'contactMobile must be a 10-digit mobile number' })
      .allow('', null),
    isActive: Joi.boolean(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),
};

const getColleges = {
  query: Joi.object().keys({
    collegeId: Joi.string().trim(),
    annaUniversityId: Joi.string().trim(),
    name: Joi.string().trim(),
    contactMobile: Joi.string().trim(),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCollege = {
  params: Joi.object().keys({
    collegeId: Joi.string().trim().required(),
  }),
};

const updateCollege = {
  params: Joi.object().keys({
    collegeId: Joi.string().trim().required(),
  }),
  body: Joi.object()
    .keys({
      collegeId: Joi.string().trim(),
      annaUniversityId: Joi.string().trim().allow('', null),
      name: Joi.string().trim(),
      logoUrl: Joi.string().trim().uri().allow('', null),
      contactMobile: Joi.string()
        .trim()
        .pattern(/^[0-9]{10}$/)
        .messages({ 'string.pattern.base': 'contactMobile must be a 10-digit mobile number' })
        .allow('', null),
      isActive: Joi.boolean(),
      createdAt: Joi.date(),
      updatedAt: Joi.date(),
    })
    .min(1),
};

const deleteCollege = {
  params: Joi.object().keys({
    collegeId: Joi.string().trim().required(),
  }),
};

const createCollegeAdmin = {
  params: Joi.object().keys({
    collegeId: Joi.string().trim().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      Name: Joi.string().trim(),
      phone_number: Joi.string()
        .trim()
        .required()
        .pattern(/^[0-9]{10}$/)
        .messages({ 'string.pattern.base': 'phone_number must be a 10-digit mobile number' }),
      email: Joi.string().trim().required().email(),
      departmentId: Joi.string().trim().allow('', null),
    })
    .custom((value, helpers) => {
      const normalizedName = value.name || value.Name;
      if (!normalizedName) {
        return helpers.message('"name" is required');
      }
      return value;
    }),
};

module.exports = {
  createCollege,
  getColleges,
  getCollege,
  updateCollege,
  deleteCollege,
  createCollegeAdmin,
};
