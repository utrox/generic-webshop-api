const mongoose = require("mongoose");
const { deleteImage } = require("../utils/image-handling");

const supportedCategories = [
  "bathroom",
  "bedroom",
  "dining room",
  "hallway",
  "kitchen",
  "office",
  "other",
  "outside",
];

// construct Product schema
const ProductSchema = mongoose.Schema(
  {
    title: {
      type: String,
      maxlength: 100,
      trim: true,
      required: [true, "Please input name for the product."],
    },

    description: {
      type: String,
      maxlength: 500,
      trim: true,
      required: [true, "Please input description for the product."],
    },

    price: {
      type: Number,
      min: [1, "Price cannot be lower than $1."],
      required: [true, "Please input price for the product."],
    },

    averageRating: {
      type: Number,
      min: [1, "There was some kind of error. Rating too low."],
      max: [5, "There was some kind of error. Rating too high."],
    },

    manufacturer: {
      type: String,
      maxlength: 100,
      trim: true,
      default: "Unknown",
    },

    category: {
      type: String,
      enum: {
        values: supportedCategories,
        message: `{VALUE} is not a supported category. Supported categories: ${supportedCategories}.`,
      },
      required: [true, "Please input category for the product."],
    },
    images: {
      type: Array,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

// form virtual "connection" between the Product and every Review that references it in the 'product' field.
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

// when deleting a Product ...
ProductSchema.pre("remove", function (next) {
  // ...remove all Reviews that reference it ...
  Review.deleteMany({ product: this._id });
  // ... remove all of this Product's images from the uploads folder.
  this.images.forEach((image) => {
    deleteImage(image);
  });
  next();
});

module.exports = new mongoose.model("Product", ProductSchema);
const Review = require("./Review");
