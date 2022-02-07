const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { authMiddleware } = require("../middlewares/auth-middleware");

router.route("/").get(getAllProducts).post(authMiddleware, createProduct);
router
  .route("/:id")
  .get(getSingleProduct)
  .put(authMiddleware, updateProduct)
  .delete(authMiddleware, deleteProduct);

module.exports = router;
