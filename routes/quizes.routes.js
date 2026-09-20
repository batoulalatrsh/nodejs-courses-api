const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require("../utils/userRoles");
const Quiz = require("../models/quiz.model");
const {
  addQuizValidation,
  updateQuizValidation,
} = require("../utils/validator/quizValidator");

const {
  isYourDocument,
  assignTeacherId,
} = require("../middleware/isYourDocument");

const {
  addQuiz,
  getQuizzes,
  getQuiz,
  deleteQuiz,
  updateQuiz,
} = require("../controllers/quizes.controller");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, allowedTo(userRoles.INSTACTOR), getQuizzes)
  .post(
    verifyToken,
    allowedTo(userRoles.INSTACTOR),
    addQuizValidation,
    assignTeacherId,
    addQuiz,
  );
router
  .route("/:quizId")
  .get(verifyToken, allowedTo(userRoles.INSTACTOR), getQuiz)
  .delete(
    verifyToken,
    allowedTo(userRoles.INSTACTOR),
    isYourDocument(Quiz, "quizId"),
    deleteQuiz,
  )
  .patch(
    verifyToken,
    allowedTo(userRoles.INSTACTOR),
    isYourDocument(Quiz, "quizId"),
    updateQuizValidation,
    updateQuiz,
  );

module.exports = router;
