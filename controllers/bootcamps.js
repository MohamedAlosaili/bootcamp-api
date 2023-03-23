const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // Add $ to MongoDB query operators
  let { select, sort, page, limit, ...reqQuery } = req.query;

  const filterStr = JSON.stringify(reqQuery).replace(
    /\b(lt|lte|eq|gt|gte|in)\b/g,
    str => `$${str}`
  );

  const filter = JSON.parse(filterStr);

  // .populate({ path: "courses", select: "title description" }) will return a specific fields of course document
  let query = Bootcamp.find(filter).populate("courses");

  // Select certain fields
  if (select) {
    const selectedFields = select.replace(/,/g, " ");
    query = query.select(selectedFields);
  }

  // Sort results by certain fields
  if (sort) {
    const sortBy = sort.replace(/,/g, " ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Paginate the result
  page = parseInt(page <= 0 ? 1 : page, 10) || 1;
  limit = parseInt(limit, 10) || 25;
  const startIndex = (page - 1) * limit; // 0
  const endIndex = page * limit; // 10
  const totalDocumants = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  const bootcamps = await query;

  const pagination = {};

  if (endIndex < totalDocumants) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    data: bootcamps,
    count: bootcamps.length,
    pagination,
    totalDocumants,
  });
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const { select } = req.query;

  // Find a single document by its _id field. findById(id) is almost* equivalent to findOne({ _id: id }).
  let query = Bootcamp.findById(req.params.id).populate("courses");

  if (select) {
    const selectedFields = select.replace(/,/g, " ");
    query = query.select(selectedFields);
  }

  const bootcamp = await query;

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  bootcamp.save();
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  console.log(zipcode);

  // get lat/long from geocoder
  const location = await geocoder.geocode(zipcode);
  const { longitude, latitude } = location[0];

  // To get the radius divide the dist by the earth radius
  // Earth radius is 3963 mi / 6378 km
  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    success: true,
    data: bootcamps,
    numberOfResults: bootcamps.length,
  });
});
