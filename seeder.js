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

// Load bootcamps
const bootcamps = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_data", "bootcamps.json"), "utf-8")
);

if (process.argv[2] === "-I" || process.argv[2] === "--import") {
  importDocumentsIntoDB(bootcamps);
} else if (process.argv[2] === "-D" || process.argv[2] === "--destroy") {
  deleteAllDocumentsFromDB();
} else {
  console.error(`
        There is no flag called ${process.argv[2]}

        Available flags:

        -I, --import      to import data into the database

        -D, --destroy     Delete all the data in the database
    `);
  process.exit();
}

async function importDocumentsIntoDB(documents) {
  try {
    await Bootcamp.create(documents);

    console.log("Documents loaded success ✅".green);
    process.exit();
  } catch (err) {
    console.log("Documents loaded faild ❌".red);
    console.log(err);
  }
}

async function deleteAllDocumentsFromDB() {
  try {
    await Bootcamp.deleteMany();

    console.log("Documents Deleting success ✅".green);
    process.exit();
  } catch (err) {
    console.log("Documents Deleting failed ❌".red);
    console.log(err);
  }
}
