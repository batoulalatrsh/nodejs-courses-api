const AppError = require("../utils/appError");

module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.currentUser.role)) {
      return next(new AppError().create("Invalid role", 401));
    }
    next();
  };
};
