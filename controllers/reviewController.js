const CustomError = require("../utils/customError");

const Review = require("../models/Review");
const Product = require("../models/Product");

const notFoundError = require("../utils/notFoundError");
const { checkAuthorization } = require("../utils/check-authorization");

const createReview = async (req, res) => {
  const { product: productID } = req.body;
  const { userID } = req.user;

  // check if a product with this ID exists
  const product = await Product.findOne({ _id: productID });
  if (!product) {
    return notFoundError(res, "Product", productID);
  }

  // check if a review already exists by the user about the product
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

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate("product", "title manufacturer price")
    .populate("user", "username");

  res.status(200).json({ noReviews: reviews.length, reviews });
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

  if (!rating & !title & !text) {
    throw new CustomError("Please provide updated values.", 400);
  }

  // throw error if the user is not the OP or an admin.
  checkAuthorization(review.user.valueOf(), req.user);

  // update fields where new value is provided
  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.text = text || review.text;
  await review.save();

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

  // throw error if the user is not the OP or an admin.
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
