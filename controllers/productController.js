const Product = require("../models/Product");
const notFoundError = require("../utils/send-not-found");

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(200).json({ noProducts: products.length, products });
};

const createProduct = async (req, res) => {
  const product = await Product.create({ ...req.body });
  res.status(201).json({ msg: "Product succesfully created", product });
};

const getSingleProduct = async (req, res) => {
  const productID = req.params.id;
  const product = await Product.findOne({ _id: productID });
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
  res.send(product);
};

const deleteProduct = async (req, res) => {
  const productID = req.params.id;
  const product = await Product.findOneAndRemove({ _id: productID });
  if (!product) {
    return notFoundError(res, "Product", productID);
  }
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
