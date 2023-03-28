const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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

  // Check if the bootcamp is exist before adding new course
  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  // Make sure the user is the owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to create course for this bootcamp`,
        401
      )
    );
  }

  // Add bootcamp id and user id to the course
  req.body.bootcamp = bootcampId;
  req.body.user = req.user.id;
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

  // Make sure the user is the owner of the bootcamp
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this course`,
        401
      )
    );
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

  // Make sure the user is the owner of the bootcamp
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this course`,
        401
      )
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
