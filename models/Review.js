const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    title: {
      type: String,
      maxlength: 100,
      trim: true,
      required: [true, "Please input title for the review"],
    },
    text: {
      type: String,
      maxlength: 500,
      trim: true,
      required: [true, "Please input text for the review body"],
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
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
