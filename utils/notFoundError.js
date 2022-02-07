const CustomError = require("../utils/customError");

const itemNotFound = (res, type, id) => {
  throw new CustomError(`${type} doesn't exist with id '${id}'.`, 404);
};

module.exports = itemNotFound;
