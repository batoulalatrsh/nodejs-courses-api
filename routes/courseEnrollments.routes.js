const express = require("express");

const router = express.Router({ mergeParams: true });

const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../utils/userRoles");
const {
  createEnrollment,
  getCourseEnrollments,
  deleteCourseEnrollment,
} = require("../controllers/enrollments.controller");
const {
  createEnrollmentValidator,
  deleteEnrollmentValidator,
} = require("../utils/validator/enrollmentsValidator");

router
  .route("/")
  .get(verifyToken, allowedTo(userRoles.INSTACTOR), getCourseEnrollments)
  .post(
    verifyToken,
    allowedTo(userRoles.INSTACTOR),
    createEnrollmentValidator,
    createEnrollment,
  );

router
  .route("/:enrollmentId")
  .delete(
    verifyToken,
    allowedTo(userRoles.INSTACTOR),
    deleteEnrollmentValidator,
    deleteCourseEnrollment,
  );

module.exports = router;
