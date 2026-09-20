const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { FAIL, SUCCESS } = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const Users = require("../models/user.model");
const AppError = require("../utils/appError");
const generateToken = require("../utils/generateJWT");
const { sendEmail } = require("../utils/sendEmail");

// @desc   Login
// @route  POST /api/v1/auth/login
// @access Public
exports.login = asyncWrapper(async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(
      new AppError().create("Incorrect email or password", 401, FAIL),
    );
  }

  const token = await generateToken({
    email: user.email,
    id: user._id,
    role: user.role,
  });

  return res.json({
    status: SUCCESS,
    token: token,
    data: {
      user,
    },
  });
});

// @desc   Signup
// @route  POST /api/v1/auth/signup
// @access Public
exports.register = asyncWrapper(async (req, res, next) => {
  const newUser = await Users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });

  // Generate JWT token
  const token = await generateToken({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });

  res.status(201).json({ status: SUCCESS, data: { user: newUser } });
});

// @desc   Forgot password
// @route  post /api/v1/auth/forgotPassword
// @access Public
exports.forgotPassword = asyncWrapper(async (req, res, next) => {
  // 1) Get user by email
  const user = await Users.findOne({ email: req.body.email });
  if (!user) {
    return next(
      AppError().create(
        `There is no user for this email ${req.body.email}`,
        404,
      ),
    );
  }

  // 2) If user exist, Generate hash reset random 6 digits and save in DB
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send the reset code via email
  const message = `Hi ${user.name},\n We received a request to reset the password on Aether Account. \n ${resetCode} \n Enter the code to complete the reset. \n Thanks for helping us keep your account secure.\n The Aether team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code valid for 10 minutes",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpire = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(
      new AppError().create(`There is an error in sending code ${err}`, 500),
    );
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email." });
});

// @desc   Verify Reset code
// @route  post /api/v1/auth/verifyResetCode
// @access Public
exports.verifyPassResetCode = asyncWrapper(async (req, res, next) => {
  // 1) Get user based on reset code
  const passwordResetCode = crypto
    .createHash("sha256")
    .update(req.body.code)
    .digest("hex");

  const user = await Users.findOne({
    passwordResetCode: passwordResetCode,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError().create("Reset code invalid or expired", 404));
  }
  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({ status: "Success" });
});

// @desc   Reset password
// @route  post /api/v1/auth/resetPassword
// @access Public
exports.resetPassword = asyncWrapper(async (req, res, next) => {
  // 1) Get user based on email
  const user = await Users.findOne({ email: req.body.email });
  if (!user) {
    return next(
      AppError().create(
        `There is no user for this email ${req.body.email}`,
        404,
      ),
    );
  }
  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(
      new AppError().create(
        `Reset code is not verified ${req.body.email}`,
        400,
      ),
    );
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpire = undefined;
  user.passwordResetVerified = undefined;

  await user.save();
  // 3) If everything is ok, generate token
  const token = await generateToken({
    email: user.email,
    id: user._id,
    role: user.role,
  });

  res.status(200).json({ token });
});
