const { body, param } = require("express-validator");
const { validatorMiddleware } = require("../../middleware/validatorMiddleware");
const Course = require("../../models/course.model");

exports.addQuizValidation = [
  body("title")
    .notEmpty()
    .withMessage("Quiz title is required")
    .isLength({ min: 2 })
    .withMessage("Quiz title minimum length is 2")
    .isString(),
  param("courseId")
    .isMongoId()
    .withMessage("Invalid Course ID format")
    .custom(async (val, { req }) => {
      const course = await Course.findById(val);
      if (!course) {
        throw new Error("Course Not Found!");
      }
      req.body.courseId = val;
      return true;
    }),
  body("questions")
    .isArray({ min: 1 })
    .withMessage("Questions must be a non-empty array"),
  body("questions.*.question")
    .notEmpty()
    .withMessage("Question is required")
    .isString(),
  body("questions.*.options").isArray(),
  body("questions.*.options.*")
    .notEmpty()
    .withMessage("Option cannot be empty")
    .isString(),
  body("questions.*.correctAnswer")
    .isInt({ min: 0, max: 3 })
    .withMessage("Correct answer must be an option index"),
  validatorMiddleware,
];

exports.updateQuizValidation = [
  param("quizId").isMongoId().withMessage("Invalid CourseId format"),
  body("title")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Quiz title minimum length is 2")
    .isString(),
  param("courseId")
    .isMongoId()
    .withMessage("Invalid Course ID format")
    .custom(async (val, { req }) => {
      const course = await Course.findById(val);
      if (!course) {
        throw new Error("Course Not Found!");
      }
      req.body.courseId = val;
      return true;
    }),
  body("questions")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Questions must be a non-empty array"),
  body("questions.*.question").optional().isString(),
  body("questions.*.options").optional().isArray(),
  body("questions.*.options.*").optional().isString(),
  body("questions.*.correctAnswer")
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage("Correct answer must be an option index"),
  validatorMiddleware,
];
