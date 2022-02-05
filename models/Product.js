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

ProductSchema.pre("remove", (next) => {
  // TODO: remove all reviews where the removed Product is the referenced product
});

module.exports = mongoose.model("Product", ProductSchema);
