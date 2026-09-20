const fs = require("fs/promises");
const path = require("path");

const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const { uploadFiles } = require("../middleware/uploadFilesMiddleware");
const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const Course = require("../models/course.model");
const Lesson = require("../models/lesson.model");
const Enrollment = require("../models/enrollments.model");
const factory = require("./factoryHandler");
const {updateStreakOnActivity} = require("./streak.controller");

const CONTENT_TYPE = {
  video: "video",
  image: "image",
  file: "application",
};

// Upload content of lesson
exports.uploadLessonContent = uploadFiles(CONTENT_TYPE, "content");

exports.resizeContent = asyncWrapper(async (req, res, next) => {
  if (!req.file) {
    if (
      req.body.contentType === "text" &&
      typeof req.body.content !== "object"
    ) {
      req.body.content = { text: req.body.content };
    }
    return next();
  }
  // 1) Check if expected content equal exact content
  const mimeType = req.file.mimetype.split("/")[0];
  const expectedType = CONTENT_TYPE[req.body.contentType];
  console.log("expectedType", expectedType);
  console.log("mimeType", mimeType);

  if (expectedType && expectedType !== mimeType) {
    return next(
      new AppError().create(
        `Uploaded file (${mimeType}) doesn't match contentType (${req.body.contentType})`,
        400,
        FAIL,
      ),
    );
  }

  // 2) Process the content
  const ext = path.extname(req.file.originalname) || "";
  let fileName = `content-${uuidv4()}-${Date.now()}-`;

  if (mimeType === "image") {
    fileName += `image.jpeg`;
    await sharp(req.file.buffer)
      .resize(1200, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/lessons/${fileName}`);
  } else {
    fileName += `file.${ext}`;
    await fs.writeFile(
      path.join("uploads", "lessons", fileName),
      req.file.buffer,
    );
  }
  req.body.content = {
    url: `/uploads/lessons/${fileName}`,
    fileSize: req.file.size,
    mimetype: req.file.mimetype,
  };
  next();
});

exports.modifyLessonCount = (val) => async (req, res, next) => {
  await Course.findByIdAndUpdate(req.params.courseId, {
    $inc: { lessonsCount: val },
  });
  next();
};

// Get all lesson (admin-instuctor)
// GET /courses/:courseId/lessons
exports.getAllLessons = asyncWrapper(async (req, res, next) => {
  const lessons = await Lesson.find({ courseId: req.params.courseId }).populate(
    "courseId",
    "title",
  );

  res.status(200).json({ status: SUCCESS, data: { lessons } });
});

// Get lesson for students
// Get /courses/:courseId/lessons
exports.getLessonsWithProgress = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const lessons = await Lesson.find({ courseId }).lean();
  const enrollment = await Enrollment.findOne({
    courseId,
    studentId: req.currentUser.id,
  }).select("completedLessons progressPercentage");

  if (!enrollment) {
    return next(
      new AppError().create("You are not enrolled in this course", 403),
    );
  }
  const completedSet = new Set(
    enrollment.completedLessons.map((l) => l.lesson.toString()),
  );

  const lessonsWithStatus = lessons.map((lesson) => ({
    ...lesson,
    isCompleted: completedSet.has(lesson._id.toString()),
  }));

  res.status(200).json({
    status: "success",
    progressPercentage: enrollment.progressPercentage,
    data: lessonsWithStatus,
  });
});

// Toggle lesson complete state
// PATCH /courses/:courseId/lessons/:lessonId/complete
exports.toggleLessonCompletion = asyncWrapper(async (req, res, next) => {
  // 1) Get enrollments of student
  const { courseId, lessonId } = req.params;
  const enrollment = await Enrollment.findOne({
    courseId,
    studentId: req.currentUser.id,
  }).populate("courseId", "lessonsCount");

  if (!enrollment) {
    return next(
      new AppError().create("You are not enrolled in this course", 403),
    );
  }

  // 2) Check is lesson is completed or not
  const isCompleted = enrollment.completedLessons?.some(
    (l) => l.lesson.toString() == lessonId.toString(),
  );

  if (isCompleted) {
    enrollment.completedLessons = enrollment.completedLessons.filter(
      (l) => l.lesson.toString() !== lessonId,
    );
  } else {
    enrollment.completedLessons.push({ lesson: lessonId });
  }

  // 3) Update progress Percentage
  enrollment.progressPercentage = Math.round(
    (enrollment.completedLessons.length /
      (enrollment.courseId.lessonsCount || 1)) *
      100,
  );

  await enrollment.save();

  // Streak Logic
  await updateStreakOnActivity(req.currentUser.id);

  res.status(200).json({
    status: "success",
    isCompleted: !isCompleted,
    progressPercentage: enrollment.progressPercentage,
  });
});

// Get single lesson for (student-admin-instuctor)
// GET /courses/:courseId/lessons/:lessonId
exports.getSingleLesson = factory.getOne(Lesson, "lessonId");

// Add lesson (instuctor)
// POST /courses/:courseId/lessons
exports.addLesson = factory.addOne(Lesson);

// Delete lesson (admin-instuctor)
// DELETE /courses/:courseId/lessons/:lessonId
exports.deleteLesson = factory.deleteOne(Lesson, "lessonId");

// Update lesson (instuctor)
// PUT /courses/:courseId/lessons/:lessonId
exports.updateLesson = factory.updateOne(Lesson, "lessonId");
