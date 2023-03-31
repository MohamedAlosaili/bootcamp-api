const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

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

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get current loggedin user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

// @desc    Update current loggedin user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const { email, name } = req.body;

  const details = {};
  if (email) details.email = email;
  if (name) details.name = name;

  const user = await User.findByIdAndUpdate(req.user.id, details, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Update current loggedin user password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  // Check if cuurent password is correct
  const isPasswordMatch = await user.matchPassword(currentPassword);

  if (!isPasswordMatch) {
    return next(new ErrorResponse("Current password is incorrect", 401));
  }

  user.password = newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   PSOT /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse("Please add an email", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse(`User not found with email: ${email}`, 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // Create email message
  const message = `
      Hey ${user.name}

      You are receiving this email becuase you (or someone else) 
      has request the reset of a password. Please make PUT request to:   
      ${resetUrl}

      If you don't request reset for the password you can ignore this message.
    `;

  try {
    await sendEmail({
      email,
      subject: `Reset Password`,
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Sending reset email failed", 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;

  // Get hashed password to compare with the one in the database
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const { password, confirmPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorResponse("Password doesn't match", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

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
