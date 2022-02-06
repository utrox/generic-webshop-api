const mongoose = require("mongoose");
const Review = require("./Review");
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
    manufacturer: {
      type: String,
      maxlength: 100,
      trim: true,
      default: "Unknown",
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
    category: {
      type: String,
      enum: {
        values: supportedCategories,
        message: "{VALUE} is not a supported category",
      },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    image: {
      type: String,
      default: "/uploads/default.png",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// form virtual "connection" between the Product and every Review that references it in the 'product' field.
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

// when deleting a Product, remove all Reviews that reference it.
ProductSchema.pre("remove", function (next) {
  Review.deleteMany({ product: this._id }, next);
});

module.exports = mongoose.model("Product", ProductSchema);
