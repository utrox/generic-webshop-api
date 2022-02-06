const Review = require("../models/Review");
const notFoundError = require("../utils/send-not-found");
const Product = require("../models/Product");

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate(
    "product",
    "title manufacturer price"
  );
  res.status(200).json({ noReviews: reviews.length, reviews });
};

const createReview = async (req, res) => {
  const { product: productID } = req.body;
  const product = await Product.findOne({ _id: productID });
  // check if the Product exists
  if (!product) {
    return notFoundError(res, "Product", productID);
  }
  const review = await Review.create({ ...req.body });
  return res.status(201).json({ msg: "Review succesfully created", review });
};

const getSingleReview = async (req, res) => {
  const reviewID = req.params.id;
  const review = await Review.findOne({ _id: reviewID }).populate(
    "product",
    "title manufacturer price"
  );
  if (!review) {
    return notFoundError(res, "Review", reviewID);
  }
  return res.status(200).json({ review });
};

const updateReview = async (req, res) => {
  const reviewID = req.params.id;
  const { rating, title, text } = req.body;
  const review = await Review.findOneAndUpdate(
    { _id: reviewID },
    { rating, title, text },
    { runValidators: true, context: "query", new: true }
  );
  if (!review) {
    return notFoundError(res, "Review", reviewID);
  }
  res
    .status(200)
    .json({ msg: `Review successfully edited with id '${reviewID}'`, review });
};

const deleteReview = async (req, res) => {
  const reviewID = req.params.id;
  const review = await Review.findOneAndRemove({ _id: reviewID });
  if (!review) {
    return notFoundError(res, "Review", reviewID);
  }
  returnres
    .status(200)
    .json({ msg: `Review successfully deleted with id '${reviewID}'` });
};

module.exports = {
  getAllReviews,
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
};
