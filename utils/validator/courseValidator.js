const { body, param } = require("express-validator");
const { validatorMiddleware } = require("../../middleware/validatorMiddleware");

exports.addCourseValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 chars!"),
  body("description").notEmpty().withMessage("Description is required"),
  body("category").notEmpty().withMessage("Category is required"),
  validatorMiddleware,
];

exports.updateCourseValidator = [
  param("courseId").isMongoId().withMessage("Invalid CourseId format"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description is too short"),

  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category can't be empty"),

  body("teacherId")
    .not()
    .exists()
    .withMessage("teacherId cannot be updated directly"),

  body("lessonsCount")
    .not()
    .exists()
    .withMessage("lessonsCount cannot be updated directly"),

  validatorMiddleware,
];
