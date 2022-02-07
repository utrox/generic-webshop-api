const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || 500,
    msg: err.message || "Something went wrong. Please try again later",
  };
  if (err.name === "ValidationError") {
    customError.statusCode = 400;
  }
  res.status(customError.statusCode).send({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
