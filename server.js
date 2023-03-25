// Allow dotenv variables to be used
require("dotenv").config({ path: "./config/config.env" });

const path = require("path");
const express = require("express");
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const fileUpload = require("express-fileupload");

// Bootcamps route file
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

// Connect to Database
connectDB();

// Initialize new express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Dev middleware logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// fileUpload middleware
app.use(fileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

// Error Handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Run the app on .env.PORT or 5000 port as default port
const server = app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`.yellow.bold);
  console.log(`Environment mode: ${process.env.NODE_ENV}`.blue.bold);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  // Print the err message
  console.log(`${err && err.toString()} ❌`.underline.red);

  // Close the server & exit process
  server.close(() => process.exit(1));
});
