const ErrorResponse = require("../utils/errorResponse");

async function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  console.log(`${err.stack}`.red);

  // Mongoose wrong ID
  if (err.name === "CastError") {
    error = new ErrorResponse(
      `Resource not found with id of ${err.value}`,
      404
    );
  }

  // Mongoose duplicate key (document has a unique key that already exists).
  if (err.code === 11000) {
    console.log(err);
    error = new ErrorResponse("Duplicate field value entered", 400);
  }

  // Mongoose invalid values
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map(value => value.message)
      .join(", ");

    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    data: null,
    error: error.message || "Server Error",
  });
}

module.exports = errorHandler;
