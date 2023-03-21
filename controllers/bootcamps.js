const Bootcamp = require('../models/Bootcamp');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();

    let statusCode = 200;

    if (!bootcamps) statusCode = 404;

    res.status(statusCode).json({
      success: true,
      data: bootcamps,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
      data: null,
    });
  }
};

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async (req, res, next) => {
  try {
    // Finds a single document by its _id field. findById(id) is almost* equivalent to findOne({ _id: id }).
    const bootcamp = await Bootcamp.findById(req.params.id);

    let statusCode = 200;

    if (!bootcamp) statusCode = 404;

    res.status(statusCode).json({
      success: true,
      data: bootcamp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error,
      data: null,
    });
  }
};

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);

    bootcamp.save();
    res.status(201).json({ success: true, data: bootcamp });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
      data: null,
    });
  }
};

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body);
    console.log(bootcamp);
    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    res.status(400).json({ success: false, error, data: null });
  }
};

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    console.log(bootcamp);
    res.status(204).json({ success: true, data: bootcamp });
  } catch (error) {
    res.status(400).json({ success: false, error, data: null });
  }
};
