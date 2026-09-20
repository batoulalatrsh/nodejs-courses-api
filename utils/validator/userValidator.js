const { body } = require("express-validator");
const { validatorMiddleware } = require("../../middleware/validatorMiddleware");
const User = require("../../models/user.model");

exports.addUserValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 chars!"),
  body("email")
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Incorrect email format")
    .isLength({ min: 3 })
    .withMessage("Email address must be at least 3 chars!")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (user) {
        return Promise.reject(new Error("E-mail already exist"));
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 3 chars!")
    .custom(async (val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .isLength({ min: 6 })
    .withMessage("Confirm Password must be at least 3 chars!"),
  body("role").optional(),
  validatorMiddleware,
];
