const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title for the review"],
    trim: true,
    maxlength: [50, "Title can not be more than 50 characters"],
  },
  text: {
    type: String,
    required: [true, "Please add review content"],
    maxlength: [500, "Review content can not be more than 500 characters"],
  },
  rating: {
    type: Number,
    required: [true, "Please add a rating number"],
    min: [1, "Rating must be at least 1"],
    max: [10, "Rating can not be more than 10"],
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent users from adding more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Get the average rating of bootcamp
// This is the opposit of what we do in the Course model
// Here we create a method in site methods
// In Course we create a statics that called by the constructor
ReviewSchema.methods.getAverageRating = async function (bootcampId) {
  const average = await this.constructor.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: "$bootcamp", averageRating: { $avg: "$rating" } } },
  ]);

  // if save is pre, current document won't be added to the aggregate method
  const averageRating = parseFloat(average[0].averageRating.toFixed(1)) || 0;

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Calculate averageRating after save the review
ReviewSchema.post("save", async function () {
  await this.getAverageRating(this.bootcamp);
});

// Calculate averageRating before delete the review
ReviewSchema.pre("remove", async function (next) {
  await this.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
