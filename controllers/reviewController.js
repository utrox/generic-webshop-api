const CustomError = require("../utils/customError");

const Review = require("../models/Review");
const notFoundError = require("../utils/notFoundError");
const Product = require("../models/Product");
const { checkAuthorization } = require("../utils/check-authorization");

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate("product", "title manufacturer price")
    .populate("user", "username");
  res.status(200).json({ noReviews: reviews.length, reviews });
};

const createReview = async (req, res) => {
  const { product: productID } = req.body;
  const { userID } = req.user;
  console.log(req.user);

  // check if the Product exists
  const product = await Product.findOne({ _id: productID });
  if (!product) {
    return notFoundError(res, "Product", productID);
  }

  const productAlreadyReviewedByUser = await Review.findOne({
    user: userID,
    product: productID,
  });
  if (productAlreadyReviewedByUser) {
    throw new CustomError(
      "You can only review a product once. Please edit your existing review instead.",
      401
    );
  }

  const review = await Review.create({ ...req.body, user: userID });
  return res.status(201).json({ msg: "Review succesfully created", review });
};

const getSingleReview = async (req, res) => {
  const reviewID = req.params.id;
  const review = await Review.findOne({ _id: reviewID })
    .populate("product", "title manufacturer price")
    .populate("user", "username");

  if (!review) {
    return notFoundError(res, "Review", reviewID);
  }

  return res.status(200).json({ review });
};

const updateReview = async (req, res) => {
  const reviewID = req.params.id;
  const { rating, title, text } = req.body;
  const review = await Review.findOne({ _id: reviewID });

  if (!review) {
    return notFoundError(res, "Review", reviewID);
  }

  checkAuthorization(review.user.valueOf(), req.user);

  res
    .status(200)
    .json({ msg: `Review successfully edited with id '${reviewID}'`, review });
};

const deleteReview = async (req, res) => {
  const reviewID = req.params.id;
  const review = await Review.findOne({ _id: reviewID });

  if (!review) {
    return notFoundError(res, "Review", reviewID);
  }

  // if the user is the creator, or an admin they should be able to modify the entry.
  checkAuthorization(review.user.valueOf(), req.user, res);

  await review.remove();
  return res
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
