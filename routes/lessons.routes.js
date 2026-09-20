const express = require("express");
const Lesson = require("../models/lesson.model");

const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../utils/userRoles");

const {
  addLessonValidator,
  updateLessonValidator,
} = require("../utils/validator/lessonValidator");
const {
  isYourDocument,
  assignTeacherId,
} = require("../middleware/isYourDocument");
const {
  addLesson,
  getAllLessons,
  getSingleLesson,
  deleteLesson,
  updateLesson,
  uploadLessonContent,
  resizeContent,
  modifyLessonCount,
  toggleLessonCompletion,
  getLessonsWithProgress,
} = require("../controllers/lessons.controller");

const router = express.Router({ mergeParams: true });

// For Student
router
  .route("/my-progress")
  .get(verifyToken, allowedTo(userRoles.STUDENT), getLessonsWithProgress);

router
  .route("/:lessonId/complete")
  .patch(verifyToken, allowedTo(userRoles.STUDENT), toggleLessonCompletion);

//  For instructor / admin — unchanged
router
  .route("/")
  .post(
    verifyToken,
    allowedTo(userRoles.INSTACTOR),
    uploadLessonContent,
    resizeContent,
    addLessonValidator,
    assignTeacherId,
    modifyLessonCount(1),
    addLesson,
  )
  .get(verifyToken, getAllLessons);

router
  .route("/:lessonId")
  .get(verifyToken, getSingleLesson)
  .delete(
    verifyToken,
    allowedTo(userRoles.INSTACTOR),
    isYourDocument(Lesson, "lessonId"),
    modifyLessonCount(-1),
    deleteLesson,
  )
  .patch(
    verifyToken,
    allowedTo(userRoles.INSTACTOR),
    isYourDocument(Lesson, "lessonId"),
    updateLessonValidator,
    updateLesson,
  );

module.exports = router;
