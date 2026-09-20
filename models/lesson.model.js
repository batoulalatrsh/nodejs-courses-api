const mongoose = require("mongoose");
const validator = require("validator");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
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
      ref: "Users",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["text", "video", "image", "file"],
      required: true,
    },
    content: {
      text: String,
      url: String,
      fileSize: Number,
      mimeType: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Lesson", lessonSchema);
