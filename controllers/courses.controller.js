const { SUCCESS } = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const Course = require("../models/course.model");
const factory = require("./factoryHandler");

exports.getAllCourses = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const page = +query.page || 1;
  const limit = +query.limit || 10;
  const skip = (page - 1) * limit;
  const search = query.search;

  let filters = {};

  if (search) {
    filters.title = { $regex: search, $options: "i" };
  }

  const courses = await Course.find(filters, { __v: false })
    .limit(limit)
    .skip(skip);

  res.status(200).json({ status: SUCCESS, data: { courses } });
});

exports.getSingleCourse = factory.getOne(Course, "courseId", {}, [
  { path: "lessons", select: "title contentType" },
  { path: "quizzes", select: "title" },
]);

exports.addCourse = factory.addOne(Course);

exports.updateCourse = factory.updateOne(Course, "courseId");

exports.deleteCourse = factory.deleteOne(Course, "courseId");
