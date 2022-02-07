const express = require("express");
const router = express.Router();
const {
  getAllReviews,
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const { authMiddleware } = require("../middlewares/auth-middleware");

router.route("/").get(getAllReviews).post(authMiddleware, createReview);
router
  .route("/:id")
  .get(getSingleReview)
  .put(authMiddleware, updateReview)
  .delete(authMiddleware, deleteReview);

module.exports = router;
