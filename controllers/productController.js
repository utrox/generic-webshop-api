const { query } = require("express");
const Product = require("../models/Product");
const notFoundError = require("../utils/notFoundError");

const getAllProducts = async (req, res) => {
  const { search, price, category, manufacturer, order_by } = req.query;
  const queryParameters = {};

  // if order_by parameter is not given, default sort by the most recently added Product.
  var sortBy = order_by || "-_id";

  if (search) {
    queryParameters.title = { $regex: search, $options: "i" };
  }

  if (price) {
    const [min, max] = price.split("-");
    if (!min || !max || min > max) {
      return res.status(400).json({
        msg: "Invalid price query. Please use 'price=minPrice-maxPrice' format.",
      });
    }
    queryParameters.price = { $gte: min, $lte: max };
  }

  if (category) {
    queryParameters.category = category;
  }

  if (manufacturer) {
    queryParameters.manufacturer = manufacturer;
  }

  const products = await Product.find(queryParameters).sort(sortBy);
  res.status(200).json({ noProducts: products.length, products });
};

const createProduct = async (req, res) => {
  const product = await Product.create({ ...req.body });
  res.status(201).json({ msg: "Product succesfully created", product });
};

const getSingleProduct = async (req, res) => {
  const productID = req.params.id;
  // when requesting only one pro
  const product = await Product.findOne({ _id: productID }).populate(
    "reviews",
    "title text username rating"
  );
  if (!product) {
    return notFoundError(res, "Product", productID);
  }
  res.status(200).json({ product });
};

const updateProduct = async (req, res) => {
  const productID = req.params.id;
  const { title, manufacturer, description, price, category, rating } =
    req.body;
  const product = await Product.findOneAndUpdate(
    { _id: productID },
    { title, manufacturer, description, price, category, rating },
    { runValidators: true, context: "query", new: true }
  );
  if (!product) {
    return notFoundError(res, "Product", productID);
  }
  res.status(200).json(product);
};

const deleteProduct = async (req, res) => {
  const productID = req.params.id;
  const product = await Product.findOne({ _id: productID });
  if (!product) {
    return notFoundError(res, "Product", productID);
  }
  product.remove();
  res
    .status(200)
    .json({ msg: `Product successfully deleted with id '${productID}'` });
};

module.exports = {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
