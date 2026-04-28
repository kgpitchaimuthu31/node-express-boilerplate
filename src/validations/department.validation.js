const Joi = require('joi');

const collegeIdParam = {
  params: Joi.object().keys({
    collegeId: Joi.string().trim().required(),
  }),
};

const departmentIdParam = {
  params: Joi.object().keys({
    collegeId: Joi.string().trim().required(),
    departmentId: Joi.string()
      .trim()
      .required()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .messages({ 'string.pattern.base': 'departmentId must be a valid id' }),
  }),
};

const createDepartment = {
  ...collegeIdParam,
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    code: Joi.string().trim().required(),
    description: Joi.string().trim().allow('', null),
    isActive: Joi.boolean(),
  }),
};

const listDepartments = {
  ...collegeIdParam,
};

const getDepartment = {
  ...departmentIdParam,
};

const updateDepartment = {
  ...departmentIdParam,
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      code: Joi.string().trim(),
      description: Joi.string().trim().allow('', null),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deleteDepartment = {
  ...departmentIdParam,
};

module.exports = {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
