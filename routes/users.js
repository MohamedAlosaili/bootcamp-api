const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

// Add protect and admin authorize to all router under auth/users
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const User = require("../models/User");

router.use(protect, authorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
