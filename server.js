// Allow dotenv variables to be used
require("dotenv").config({ path: "./config/config.env" });

const express = require("express");

// Middlewares
const morgan = require("morgan");

// Bootcamps route file
const bootcamps = require("./routes/bootcamps");

// Connect to Database
const connectDB = require("./config/db");
connectDB();

// Initialize new express app
const app = express();

// Dev middleware logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);

const PORT = process.env.PORT || 5000;

// Run the app on .env.PORT or 5000 port as default port
const server = app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
  console.log(`Environment mode: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error, promise) => {
  // Print the error message
  console.log(error?.toString());

  // Close the server & exit process
  server.close(() => process.exit(1));
});
