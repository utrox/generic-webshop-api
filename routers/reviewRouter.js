const express = require("express");
const router = express.Router();
const {
  getAllReviews,
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

router.route("/").get(getAllReviews).post(createReview);
router
  .route("/:id")
  .get(getSingleReview)
  .put(updateReview)
  .delete(deleteReview);

module.exports = router;
