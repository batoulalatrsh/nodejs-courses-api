const express = require("express");
const router = express.Router();
const {
  signUpValidator,
  loginValidator,
} = require("../utils/validator/authValidator");
const {
  login,
  register,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../controllers/auth.controller");

router.route("/register").post(signUpValidator, register);

router.route("/login").post(loginValidator, login);
router.route("/forgotPassword").post(forgotPassword);
router.route("/verifyPassResetCode").post(verifyPassResetCode);
router.route("/resetPassword").post(resetPassword);

module.exports = router;
