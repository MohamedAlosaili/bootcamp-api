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

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // If email or password is not passed
  if (!email || !password) {
    return next(new ErrorResponse("Please Provide an email and password", 400));
  }

  // Check user is exist
  const user = await User.findOne({ email }).select("+password");

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

  sendTokenResponse(user, 200, res);
});

// Get token from the model, create a cookie and send a response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    // httpOnly mean cookie cannot be accessed through client-side scripts, such as JavaScript.
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // Create cookie and send response
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
