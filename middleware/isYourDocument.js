const AppError = require("../utils/appError");
const userRoles = require("../utils/userRoles");
exports.isYourDocument = (Model, paramName) => async (req, res, next) => {
  const document = await Model.findById(req.params[paramName]);
  if (!document) {
    return next(new AppError().create("Document Not found", 404));
  }
  if (
    req.currentUser.role !== userRoles.ADMIN &&
    req.currentUser.id.toString() !== document.teacherId.toString()
  ) {
    return next(new AppError().create("Forbidden", 403));
  }
  next();
};

exports.assignTeacherId = (req, res, next) => {
  ((req.body.teacherId = req.currentUser.id), next());
};
