const mongoose = require("mongoose");
const Review = require("./Review");
const { removeImage } = require("../utils/image-handling");
const supportedCategories = [
  "kitchen",
  "dining room",
  "bedroom",
  "living room",
  "bathroom",
  "other",
];

// construct Product the schema
const ProductSchema = mongoose.Schema(
  {
    title: {
      type: String,
      maxlength: 100,
      trim: true,
      required: [true, "Please input name for the product"],
    },

    description: {
      type: String,
      maxlength: 500,
      trim: true,
      required: [true, "Please input description for the product"],
    },

    price: {
      type: Number,
      min: [1, "Price cannot be lower than $1."],
      required: [true, "Please input price for the product"],
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
        message: "{VALUE} is not a supported category",
      },
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

ProductSchema.statics.updateAverageReviews = async function (productID) {
  // get and calculate average of those reviews' ratings
  const reviewsAboutProduct = await Review.find({ product: productID });
  const total = reviewsAboutProduct.reduce((prevValue, review) => {
    return prevValue + review.rating;
  }, 0);
  const averageRating = total / reviewsAboutProduct.length;

  const product = await this.findOneAndUpdate(
    { _id: productID },
    { averageRating },
    { runValidators: true, new: true }
  );
};

// when deleting a Product ...
ProductSchema.pre("remove", function (next) {
  // ...remove all Reviews that reference it ...
  Review.deleteMany({ product: this._id }, next);
  // ... remove all of this Product's images from the uploads folder.
  this.images.forEach((image) => {
    removeImage(image);
  });
});

module.exports = new mongoose.model("Product", ProductSchema);
