const express = require("express");

const router = express.Router();

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto,
} = require("../controllers/bootcamps");

const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

// Protection middleware for protected routes
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const Bootcamp = require("../models/Bootcamp");

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router
  .route("/")
  .get(advancedResults(Bootcamp, ["courses", "reviews"]), getBootcamps)
  .post(protect, authorize("admin", "publisher"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("admin", "publisher"), updateBootcamp)
  .delete(protect, authorize("admin", "publisher"), deleteBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorize("admin", "publisher"), uploadBootcampPhoto);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

module.exports = router;
