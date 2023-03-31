// Allow dotenv variables to be used
require("dotenv").config({ path: "./config/config.env" });

const path = require("path");
const express = require("express");
const connectDB = require("./config/db");
const morgan = require("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

// Connect to Database
connectDB();

// Initialize new express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// # Securty middlewares #
// Sanitize Data to prevent NoSQL injection
app.use(mongoSanitize());
// Helmet secure Express app by setting various HTTP security headers.
app.use(helmet());
// Prevent cross-site scripting (XSS) attack
app.use(xss());
// Limit requests per id to 60 request per minute
// You can limit certain routes e.g. resetpassword route
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000, // 60 request limit per 5 minutes
    max: 60,
  })
);
// Protect against HTTP Parameter Pollution attacks
app.use(hpp());
// CORS enable other domains to connect and make requests to this API
app.use(cors());

// Cookie parser middleware
// Now we have access to res.cookie() and req.signedCookie
app.use(cookieParser());

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
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

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
  console.log(`${err.toString()} ❌`.underline.red);
  console.log(err.stack);

  // Close the server & exit process
  server.close(() => process.exit(1));
});
