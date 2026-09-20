const express = require("express");

const router = express.Router({ mergeParams: true });
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../utils/userRoles");

const { getMyCourses } = require("../controllers/enrollments.controller");

// For STUDENTS level to get their courses
router
  .route("/my-courses")
  .get(verifyToken, allowedTo(userRoles.STUDENT), getMyCourses);

module.exports = router;
