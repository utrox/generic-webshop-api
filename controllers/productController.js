const Product = require("../models/Product");
const notFoundError = require("../utils/notFoundError");
const { handleImages } = require("../utils/image-handling.js");
const CustomError = require("../utils/customError");

const createProduct = async (req, res) => {
  // create the product
  const product = await Product.create({
    ...req.body,
  });

  // validate and upload images
  const imagePayload = {
    currentImages: product.images,
    imagesToAdd: req.files,
    productID: product.id,
    imagesToRemove: [],
  };
  const { imageHandling, currentImages: newImages } = await handleImages(
    imagePayload
  );

  product.images = newImages;
  product.markModified("images");
  await product.save();
  res.status(201).json({
    msg: "Product succesfully created",
    product,
    imageHandling,
  });
};

const getAllProducts = async (req, res) => {
  const { search, price, category, manufacturer, order_by } = req.query;
  const queryParameters = {};

  // sort default by most recent Product
  var sortBy = order_by || "-_id";

  // if these values are given, add them to queryParameters
  search && (queryParameters.title = { $regex: search, $options: "i" });
  category && (queryParameters.category = category);
  manufacturer && (queryParameters.manufacturer = manufacturer);

  // if a price is given...
  if (price) {
    const [min, max] = price.split("-");
    // ...check if it's a valid query. if not, ignore.
    +min <= +max && (queryParameters.price = { $gte: min, $lte: max });
  }

  const products = await Product.find(queryParameters).sort(sortBy);
  res.status(200).json({ noProducts: products.length, products });
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
  const { title, manufacturer, description, price, category, imagesToRemove } =
    req.body;

  const product = await Product.findOneAndUpdate(
    { _id: productID },
    { title, manufacturer, description, price, category },
    { runValidators: true, context: "query", new: true }
  );

  if (!product) {
    return notFoundError(res, "Product", productID);
  }

  const imagePayload = {
    currentImages: product.images,
    imagesToAdd: req.files,
    productID: product.id,
    imagesToRemove,
  };
  const { imageHandling, currentImages: newData } = await handleImages(
    imagePayload
  );

  product.images = newData;
  product.markModified("images");
  await product.save();

  res.status(200).json({
    msg: "Updating the product was successful.",
    product,
    imageHandling,
  });
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
