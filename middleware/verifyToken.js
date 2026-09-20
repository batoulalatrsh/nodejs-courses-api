const jwt = require("jsonwebtoken");
const { ERROR } = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const User = require("../models/user.model");
const asyncWrapper = require("../middleware/asyncWrapper");

const verifyToken = asyncWrapper(async (req, res, next) => {
  // 1) Check if token exist, if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError().create(
        "You are not logged in, Please login to get this route",
        401,
        ERROR,
      ),
    );
  }

  // 2) Verify token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exist
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(
      new AppError().create(
        "The user that belong to this token does not exist",
        401,
        ERROR,
      ),
    );
  }

  req.currentUser = decodedToken;
  next();
});

module.exports = verifyToken;
