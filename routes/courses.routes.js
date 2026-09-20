const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../utils/userRoles");
const Course = require("../models/course.model");

const {
  isYourDocument,
  assignTeacherId,
} = require("../middleware/isYourDocument");
const {
  getAllCourses,
  getSingleCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses.controller");
const {
  addCourseValidator,
  updateCourseValidator,
} = require("../utils/validator/courseValidator");

// Give you mini app router
const router = express.Router();

// Create nested router => course/:courseId/lessons
const lessonsRouter = require("./lessons.routes");
const quizesRouter = require("../routes/quizes.routes");
const coursesEnrollmentsRouter = require("./courseEnrollments.routes");
router.use("/:courseId/lessons", lessonsRouter);
router.use("/:courseId/quizzes", quizesRouter);
router.use("/:courseId/enrollments", coursesEnrollmentsRouter);

router
  .route("/")
  .get(verifyToken, getAllCourses)
  .post(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.INSTACTOR),
    addCourseValidator,
    assignTeacherId,
    addCourse,
  );

router
  .route("/:courseId")
  .get(verifyToken, getSingleCourse)
  .put(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.INSTACTOR),
    isYourDocument(Course, "courseId"),
    updateCourseValidator,
    updateCourse,
  )
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.INSTACTOR),
    isYourDocument(Course, "courseId"),
    deleteCourse,
  );

module.exports = router;
