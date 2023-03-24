const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  const bootcamp = req.params.bootcampId;
  const filter = bootcamp ? { bootcamp } : {};

  const courses = await Course.find(filter).populate({
    path: "bootcamp",
    select: "name description",
  });

  res.status(200).json({
    success: true,
    data: courses,
    count: courses.length,
  });
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Create course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  const { bootcampId } = req.params;
  console.log(bootcampId);
  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  req.body.bootcamp = bootcampId;
  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let course = await Course.findById(id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${id}`, 404));
  }

  course = await Course.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${id}`, 404));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
