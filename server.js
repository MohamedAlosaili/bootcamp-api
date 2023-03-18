const express = require("express");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Allow dotenv variables to be used
dotenv.config({ path: "./config/config.env" });

// Initialize new express app
const app = express();

app.get("/api/v1/bootcamps", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Show all bootcamps available" });
});

app.get("/api/v1/bootcamps/:id", (req, res) => {
  res.status(200).json({ success: true, message: "Show a single bootcamp" });
});

app.post("/api/v1/bootcamps", (req, res) => {
  res.status(201).json({ success: true, message: "Create a new bootcamp" });
});

app.put("/api/v1/bootcamps/:id", (req, res) => {
  res.status(200).json({
    success: true,
    message: `Update bootcamp of id: ${req.params.id}`,
  });
});

app.delete("/api/v1/bootcamps/:id", (req, res) => {
  res.status(200).json({
    success: true,
    message: `Delete bootcamp of id: ${req.params.id}`,
  });
});

app.get("/api/v1/courses", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Show all courses available" });
});

app.get("/api/v1/reviews", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Show all reviews available" });
});

app.get("/api/v1/users", (req, res) => {
  res.status(200).json({ success: true, message: "Show all users available" });
});

app.get("/api/v1/bootcamps/:id", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: `Show bootcamp with id:${req.params.id}` });
});

// ********************************
app.route();
// Bootcamp routes and methods
app.get("/api/v1/bootcamps", getAllBootcamps);
app.get("/api/v1/bootcamps/:id", getSingleBootcamp);
app.post("/api/v1/bootcamps", addNewBootcamp);
app.put("/api/v1/bootcamps/:id", updateBootcamp);
app.delete("/api/v1/bootcamps/:id", deleteBootcamp);

app.get("/api/v1/courses", getAllCourses);
app.get("/api/v1/courses/:id", getSingleCourse);
app.post("/api/v1/courses", addNewCourse);
app.put("/api/v1/courses/:id", updateCourse);
app.delete("/api/v1/courses/:id", deleteCourse);

app.get("/api/v1/reviews", getAllReviews);
app.get("/api/v1/reviews/:id", getSingleReview);
app.post("/api/v1/reviews", addNewReview);
app.put("/api/v1/reviews/:id", updateReview);
app.delete("/api/v1/reviews/:id", deleteReview);

app.get("/api/v1/users", getAllUsers);
app.get("/api/v1/users/:id", getSingleUser);
app.post("/api/v1/users", addNewUser);
app.put("/api/v1/users/:id", updateUser);
app.delete("/api/v1/users/:id", deleteUser);

const PORT = process.env.PORT || 5000;

// Run the app on .env.PORT or 5000 port as default port
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
  console.log(`Environment mode: ${process.env.NODE_ENV}`);
});
