const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

// A Model convention is (Singular & Starting with uppercase)
const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      maxlength: [50, "Name can not be more than 50 characters"],
      trim: true,
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be more than 500 characters"],
      trim: true,
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      // enum helps to specify the accepted values [value1, value2, etc].
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating must can not be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  // These two object are important to add virtuals fields
  // when the document is converting to JSON or plain Object
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
  // another way to add those objects:
  // BootcampSchema.set('toObject', { virtuals: true });
  // BootcampSchema.set('toJSON', { virtuals: true });
);

// Create Bootcamp slug from the name
BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

BootcampSchema.pre("save", async function (next) {
  try {
    const locations = await geocoder.geocode(this.address);
    const {
      formattedAddress,
      streetName: street,
      city,
      stateCode: state,
      zipcode,
      country,
      countryCode,
      latitude,
      longitude,
    } = locations[0];

    this.location = {
      type: "Point",
      coordinates: [longitude, latitude],
      formattedAddress,
      street,
      city,
      state,
      zipcode,
      country: country || countryCode,
    };

    this.address = undefined;

    next();
  } catch (err) {
    next(err);
  }
});

/* 
  Import Note:
    - Statics called on the model itself
      for example Bootcamp.create is statics 
    
    - On the other hand, methods call on the instance (or what you have returned) from the model
      const bootcamp = Bootcamp.create({ ... })
      bootcamp.method
*/

// Cascade delete - Delete courses of the bootcamp
BootcampSchema.pre("remove", async function (next) {
  try {
    await this.model("Course").deleteMany({ bootcamp: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

// Cascade delete - Delete reviews of the bootcamp
BootcampSchema.pre("remove", async function (next) {
  try {
    await this.model("Review").deleteMany({ bootcamp: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

// Reverse populate with virtuals - Shows all courses related to each bootcamp
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

// Reverse populate with virtuals - Shows all reviews related to each bootcamp
BootcampSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
