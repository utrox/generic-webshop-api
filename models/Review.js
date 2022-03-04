const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    title: {
      type: String,
      maxlength: 100,
      trim: true,
      required: [true, "Please input title for the review."],
    },
    text: {
      type: String,
      maxlength: 500,
      trim: true,
      required: [true, "Please input text for the review body."],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "No user given."],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: [true, "Please provide product ID."],
    },
    rating: {
      type: Number,
      min: [1, "Your rating must be a number between 1 and 5."],
      max: [5, "Your rating must be a number between 1 and 5."],
    },
  },
  { timestamps: true, versionKey: false }
);

const updateAvarageReview = async function () {
  // find all reviews referencing the same product
  const reviewsAboutProduct = await Review.find({ product: this.product });
  const product = await Product.findOne({ _id: this.product });

  if (reviewsAboutProduct.length === 0) {
    product.averageRating = null;
    await product.save();
    return;
  }

  // calculate their reviews' average rating
  const total = reviewsAboutProduct.reduce((prevValue, review) => {
    return prevValue + review.rating;
  }, 0);

  const averageRating =
    Math.round((total / reviewsAboutProduct.length) * 100) / 100;

  // update the product's averageRating field.
  product.averageRating = averageRating;
  await product.save();
};

ReviewSchema.post("save", updateAvarageReview);
ReviewSchema.post("remove", updateAvarageReview);

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
const Product = require("./Product");
