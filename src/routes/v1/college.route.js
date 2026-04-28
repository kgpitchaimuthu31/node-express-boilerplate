const express = require('express');
const validate = require('../../middlewares/validate');
const usersCollectionJwt = require('../../middlewares/usersCollectionJwt');
const canAccessCollege = require('../../middlewares/canAccessCollege');
const collegeValidation = require('../../validations/college.validation');
const departmentValidation = require('../../validations/department.validation');
const collegeController = require('../../controllers/college.controller');
const departmentController = require('../../controllers/department.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(collegeValidation.createCollege), collegeController.createCollege)
  .get(validate(collegeValidation.getColleges), collegeController.getColleges);

router
  .route('/:collegeId')
  .get(validate(collegeValidation.getCollege), collegeController.getCollege)
  .patch(validate(collegeValidation.updateCollege), collegeController.updateCollege)
  .delete(validate(collegeValidation.deleteCollege), collegeController.deleteCollege);

router
  .route('/:collegeId/admins')
  .post(validate(collegeValidation.createCollegeAdmin), collegeController.createCollegeAdmin);

router
  .route('/:collegeId/departments')
  .post(
    usersCollectionJwt(),
    canAccessCollege(),
    validate(departmentValidation.createDepartment),
    departmentController.createDepartment
  )
  .get(
    usersCollectionJwt(),
    canAccessCollege(),
    validate(departmentValidation.listDepartments),
    departmentController.listDepartments
  );

router
  .route('/:collegeId/departments/:departmentId')
  .get(
    usersCollectionJwt(),
    canAccessCollege(),
    validate(departmentValidation.getDepartment),
    departmentController.getDepartment
  )
  .patch(
    usersCollectionJwt(),
    canAccessCollege(),
    validate(departmentValidation.updateDepartment),
    departmentController.updateDepartment
  )
  .delete(
    usersCollectionJwt(),
    canAccessCollege(),
    validate(departmentValidation.deleteDepartment),
    departmentController.deleteDepartment
  );

module.exports = router;
