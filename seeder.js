const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Config environment variables
dotenv.config({ path: "./config/config.env" });

// Connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Import Bootcamp model
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require("./models/User");
const Review = require("./models/Review");

// Load files
const bootcamps = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_data", "bootcamps.json"), "utf-8")
);

const courses = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_data", "courses.json"), "utf-8")
);

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_data", "users.json"), "utf-8")
);

const reviews = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_data", "reviews.json"), "utf-8")
);

if (process.argv[2] === "-i" || process.argv[2] === "--import") {
  importDocumentsIntoDB();
} else if (process.argv[2] === "-d" || process.argv[2] === "--destroy") {
  deleteAllDocumentsFromDB();
} else {
  console.error(`
        There is no flag called ${process.argv[2]}

        Available flags:

        -i, --import      to import data into the database

        -d, --destroy     Delete all the data in the database
    `);
  process.exit();
}

async function importDocumentsIntoDB() {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);

    console.log("Documents loaded success ✅".green.inverse);
    process.exit();
  } catch (err) {
    console.log("Documents loaded faild ❌".red);
    console.log(err);
    process.exit();
  }
}

async function deleteAllDocumentsFromDB() {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log("Documents Deleting success ✅".red.inverse);
    process.exit();
  } catch (err) {
    console.log("Documents Deleting failed ❌".red);
    console.log(err);
    process.exit();
  }
}
