const mongoose = require("mongoose");

const enrollementsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: [
      {
        lesson: mongoose.Schema.Types.ObjectId,
        completedAt: { type: Date, default: Date.now },
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Prevents duplicate enrollment at DB level
enrollementsSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollementsSchema);
