const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  weeks: {
    type: String,
    required: [true, "Please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tuition cost"],
  },
  minimumSkill: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: [true, "Please add a minimum skill"],
  },
  scholarhipsAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
});

// Static method to calc the average of courses tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    {
      $group: { _id: "$bootcamp", averageCost: { $avg: "$tuition" } },
    },
  ]);

  try {
    await this.model("Bootcamp").updateOne(
      { _id: bootcampId },
      {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
      }
    );
  } catch (err) {
    console.error(err);
  }
};

// Calculate the averageCost of the bootcamp when a new course added
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Re-calculate the averageCost of the bootcamp when a course deleted
CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
