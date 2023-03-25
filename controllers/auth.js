const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});

// @desc    login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // If email or password is not passed
  if (!email || !password) {
    const missingValues = [];

    if (!email) missingValues.push("email");
    if (!password) missingValues.push("password");

    const article = missingValues.includes("email") ? "an" : "a";
    return next(
      new ErrorResponse(
        `Please provide ${article} ${missingValues.join(" and ")}`,
        400
      )
    );
  }

  // Check if the user exist
  const user = await User.findOne({ email }).select("+password");

  // Check the email
  if (!user) {
    // I think it's better to specify why it's not valid e.g. Email doesn't exist
    // The instructor said it's not a good idea to hint
    // if the wrong is email or password for security measures
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // Check if the password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    // e.g. Wrong password
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});
