const mongoose = require("mongoose");

// Schema is class inside moongoose obj
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, "Description is too short"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    lessonsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual population to show quizzes and lessons of each course
courseSchema.virtual("lessons", {
  ref: "Lesson",
  foreignField: "courseId",
  localField: "_id",
});
courseSchema.virtual("quizzes", {
  ref: "Quiz",
  foreignField: "courseId",
  localField: "_id",
});

//compile schema inside the model
module.exports = mongoose.model("Course", courseSchema);
