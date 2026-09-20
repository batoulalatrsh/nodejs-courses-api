const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
        trim: true,
      },
      options: {
        type: [String],
        required: true,
        validate: {
          validator: (options) => options.length === 4,
          message: "Question must have 4 options only",
        },
      },
      correctAnswer: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Quiz", quizSchema);
