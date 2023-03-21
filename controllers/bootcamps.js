const Bootcamp = require("../models/Bootcamp");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: "Show all bootcamps", m: req.hello });
};

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Display ${req.params.id} bootcamp` });
};

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
  console.log(req.body);
  const bootcamp = await Bootcamp(req.body);
  console.log("#".repeat(35).bgGreen);
  console.log(bootcamp);
  bootcamp.save(error => console.log(error));
  res.status(201).json({ success: true, data: bootcamp });
};

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Update ${req.params.id} bootcamp` });
};

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete ${req.params.id} bootcamp` });
};
