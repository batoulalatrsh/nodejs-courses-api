const mongoose = require("mongoose");
const validator = require("validator");
const userRoles = require("../utils/userRoles");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Invalid Email Address."],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String, //Option ['ADMIN', 'STUDENT, 'INSTACTOR']
    enum: [userRoles.ADMIN, userRoles.STUDENT, userRoles.INSTACTOR],
    default: userRoles.STUDENT,
  },
  avatar: {
    type: String,
  },
  passwordResetCode: String,
  passwordResetExpire: Date,
  passwordResetVerified: Boolean,
  streak: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDay: { type: Date, default: null },
  },
});

userSchema.pre("save", async function () {
  // Check if password don't change from last time
  if (!this.isModified("password")) return;
  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("Users", userSchema);
