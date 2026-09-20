const { validationResult } = require("express-validator");
const AppError = require("../utils/appError");
const { FAIL } = require("../utils/httpStatusText");

exports.validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError().create({ errors: errors.array() }, 400, FAIL));
  }
  next();
};
