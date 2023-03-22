const ErrorResponse = require("../utils/errorResponse");

async function errorHandler(err, req, res, next) {
  let error = { ...err };
  console.log(err);
  console.error(`${err.stack}`.red);

  // Mongoose wrong ID
  if (err.name === "CastError") {
    error = new ErrorResponse(
      `Resourse not found with id of ${err.value}`,
      404
    );
  }

  // Mongoose duplicate key (document has a unique key that already exists).
  if (err.code === 11000) {
    error = new ErrorResponse(
      `${Object.keys(err.keyValue)[0]} "${
        err.keyValue[Object.keys(err.keyValue)[0]]
      }" already exist in the database`,
      400
    );
  }

  // Mongoose invalid values
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map(value => value.message)
      .join(", ");

    error = new ErrorResponse(message, 400);
  }
  console.log(error.message);
  res.status(error.statusCode || 500).json({
    success: false,
    data: null,
    error: error.message,
  });
}

module.exports = errorHandler;
