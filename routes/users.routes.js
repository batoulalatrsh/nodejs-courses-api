const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const { INSTACTOR, ADMIN } = require("../utils/userRoles");
const {
  getAllUsers,
  getUser,
  addUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
} = require("../controllers/users.controller");
const { addUserValidator } = require("../utils/validator/userValidator");

// Actions took by Admin
router
  .route("/")
  .get(verifyToken, allowedTo(INSTACTOR, ADMIN), getAllUsers)
  .post(verifyToken, allowedTo(ADMIN), addUserValidator, addUser);

router
  .route("/:userId")
  .get(verifyToken, allowedTo(INSTACTOR, ADMIN), getUser)
  .delete(verifyToken, allowedTo(ADMIN), deleteUser);

module.exports = router;
