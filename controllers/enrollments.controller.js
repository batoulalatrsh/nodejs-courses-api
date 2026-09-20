const { SUCCESS, FAIL } = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const asyncWrapper = require("../middleware/asyncWrapper");
const Enrollment = require("../models/enrollments.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");

// Get /api/enrollments/my-courses
// allowed to(Student)
exports.getMyCourses = asyncWrapper(async (req, res, next) => {
  const { id } = req.currentUser;

  const enrollments = await Enrollment.find({ studentId: id }).populate(
    "courseId",
  );

  if (enrollments.length === 0) {
    return next(new AppError().create("No Enrollments Found", 204, FAIL));
  }

  const courses = enrollments.map((enrollment) => enrollment.courseId);

  res.status(200).json({ status: SUCCESS, data: { courses } });
});

// Create enrollment by instuctor
exports.createEnrollment = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const { studentId } = req.body;
  const { id: instructorId } = req.currentUser;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError().create("Course Not Found!", 404, FAIL));
  }

  if (course.teacherId.toString() !== instructorId) {
    return next(
      new AppError().create(
        "You are not allowed to enroll students in this course",
        403,
        FAIL,
      ),
    );
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== "STUDENT") {
    return next(
      new AppError().create("There is no student with this ID", 404, FAIL),
    );
  }
  console.log(student.role);

  const existingEnrollment = await Enrollment.findOne({
    studentId,
    courseId,
  });

  if (existingEnrollment) {
    return next(new AppError().create("Student already enrolled", 400, FAIL));
  }

  const newEnrollment = await Enrollment.create({
    courseId,
    studentId,
  });
  res.status(201).json({ status: SUCCESS, data: { newEnrollment } });
});

// Get enrollment by instuctor
exports.getCourseEnrollments = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const { id: instructorId } = req.currentUser;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError().create("Course Not Found!", 404, FAIL));
  }

  if (course.teacherId.toString() !== instructorId) {
    return next(
      new AppError().create(
        "You are not allowed to enroll students in this course",
        403,
        FAIL,
      ),
    );
  }

  const enrollments = await Enrollment.find({
    courseId,
  }).populate("studentId", "name email");
  res.status(201).json({ status: SUCCESS, data: { enrollments } });
});

// Delete enrollment by instuctor
exports.deleteCourseEnrollment = asyncWrapper(async (req, res, next) => {
  const { courseId, enrollmentId } = req.params;
  const { id: instructorId } = req.currentUser;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError().create("Course Not Found!", 404, FAIL));
  }

  if (course.teacherId.toString() !== instructorId) {
    return next(
      new AppError().create(
        "You are not allowed to enroll students in this course",
        403,
        FAIL,
      ),
    );
  }

  const enrollment = await Enrollment.findOne({ _id: enrollmentId, courseId });
  if (!enrollment) {
    return next(new AppError().create("Enrollment Not Found!", 404, FAIL));
  }

  await Enrollment.deleteOne({ _id: enrollmentId });

  res.status(200).json({ status: SUCCESS, data: null });
});
