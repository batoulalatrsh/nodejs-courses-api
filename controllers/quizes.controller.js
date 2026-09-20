const { SUCCESS } = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const Quiz = require("../models/quiz.model");
const factory = require("./factoryHandler");

exports.getQuizzes = asyncWrapper(async (req, res, next) => {
  const quizzes = await Quiz.find(
    {},
    { __v: false, "questions.correctAnswer": false },
  );

  res.status(200).json({ status: SUCCESS, data: { quizzes } });
});

exports.getQuiz = factory.getOne(Quiz, "quizId", {
  "questions.correctAnswer": false,
});

exports.addQuiz = factory.addOne(Quiz);

exports.updateQuiz = factory.updateOne(Quiz, "quizId");

exports.deleteQuiz = factory.deleteOne(Quiz, "quizId");
