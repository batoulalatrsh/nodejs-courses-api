const { check, param } = require("express-validator");
const { validatorMiddleware } = require("../../middleware/validatorMiddleware");

exports.createEnrollmentValidator = [
  check("studentId")
    .notEmpty()
    .withMessage("studentId is required")
    .isMongoId()
    .withMessage("Invalid studentId format"),
  param("courseId").isMongoId().withMessage("Invalid courseId format"),
  validatorMiddleware,
];

exports.deleteEnrollmentValidator = [
  check("courseId").isMongoId().withMessage("Invalid courseId format"),
  check("enrollmentId").isMongoId().withMessage("Invalid enrollmentId format"),
  validatorMiddleware,
];
