const { body, param } = require("express-validator");
const { validatorMiddleware } = require("../../middleware/validatorMiddleware");
const Course = require("../../models/course.model");
const Lesson = require("../../models/lesson.model");

exports.addLessonValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 chars!"),

  body("description").notEmpty().withMessage("Description is required"),
  param("courseId")
    .isMongoId()
    .withMessage("Invalid CourseId format")
    .custom(async (val, { req }) => {
      const course = await Course.findById(val);
      if (!course) {
        throw new Error("Course Not Found!");
      }
      req.body.courseId = val;
      return true;
    }),
  body("contentType")
    .isIn(["text", "video", "image", "file"])
    .withMessage("Content must be text, video, file, image only!"),

  body("content.text")
    .if(body("contentType").equals("text"))
    .notEmpty()
    .withMessage("Content text is required")
    .isLength({ min: 2 })
    .withMessage("Content text is too short"),

  body("content.url")
    .if(body("contentType").equals("video"))
    .notEmpty()
    .withMessage("Content video is required")
    .custom(
      (value) =>
        /\.(mp4|webm|mov)$/i.test(value) || /youtube|vimeo/i.test(value),
    )
    .withMessage("Unsupported video format"),

  body("content.url")
    .if(body("contentType").equals("image"))
    .notEmpty()
    .withMessage("Content image is required"),
  body("content.url")
    .if(body("contentType").equals("file"))
    .notEmpty()
    .withMessage("File url is required"),

  body("content.mimeType")
    .if(body("contentType").equals("file"))
    .notEmpty()
    .withMessage("File type is required"),
  validatorMiddleware,
];
exports.updateLessonValidator = [
  param("lessonId")
    .isMongoId()
    .withMessage("Invalid LessonId format")
    .custom(async (val, { req }) => {
      const lesson = await Lesson.findById(val);
      if (!lesson) throw new Error("Lesson Not Found!");
      req.effectiveContentType = req.body.contentType || lesson.contentType;
      req.currentLesson = lesson;
      return true;
    }),

  param("courseId")
    .isMongoId()
    .withMessage("Invalid CourseId format")
    .custom(async (val, { req }) => {
      const course = await Course.findById(val);
      if (!course) throw new Error("Course Not Found!");
      req.body.courseId = val;
      return true;
    }),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 chars!"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description can't be empty"),

  body("contentType")
    .optional()
    .isIn(["text", "video", "image", "file"])
    .withMessage("Content must be text, video, file, image only!"),

  body("content.text")
    .if((value, { req }) => req.effectiveContentType === "text")
    .custom((value, { req }) => {
      const isSwitchingType =
        req.body.contentType &&
        req.body.contentType !== req.currentLesson.contentType;

      if (!value) {
        if (isSwitchingType) {
          throw new Error(
            "Content text is required when switching to text type",
          );
        }
        return true; // مش بتغيّري النوع ومبعتيش content.text — مفيش مشكلة
      }
      if (value.length < 2) {
        throw new Error("Content text is too short");
      }
      return true;
    }),

  body("content.url")
    .if((value, { req }) => req.effectiveContentType === "video")
    .custom((value, { req }) => {
      const isSwitchingType =
        req.body.contentType &&
        req.body.contentType !== req.currentLesson.contentType;

      if (!value) {
        if (isSwitchingType) {
          throw new Error(
            "Content video is required when switching to video type",
          );
        }
        return true;
      }
      if (!/\.(mp4|webm|mov)$/i.test(value) && !/youtube|vimeo/i.test(value)) {
        throw new Error("Unsupported video format");
      }
      return true;
    }),

  body("content.url")
    .if((value, { req }) => req.effectiveContentType === "image")
    .custom((value, { req }) => {
      const isSwitchingType =
        req.body.contentType &&
        req.body.contentType !== req.currentLesson.contentType;

      if (!value && isSwitchingType) {
        throw new Error(
          "Content image is required when switching to image type",
        );
      }
      return true;
    }),

  body("content.url")
    .if((value, { req }) => req.effectiveContentType === "file")
    .custom((value, { req }) => {
      const isSwitchingType =
        req.body.contentType &&
        req.body.contentType !== req.currentLesson.contentType;

      if (!value && isSwitchingType) {
        throw new Error("File url is required when switching to file type");
      }
      return true;
    }),

  body("content.mimeType")
    .if((value, { req }) => req.effectiveContentType === "file")
    .custom((value, { req }) => {
      const isSwitchingType =
        req.body.contentType &&
        req.body.contentType !== req.currentLesson.contentType;

      if (!value && isSwitchingType) {
        throw new Error("File type is required when switching to file type");
      }
      return true;
    }),

  validatorMiddleware,
];
