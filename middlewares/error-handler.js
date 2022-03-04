const errorHandlerMiddleware = (err, req, res, next) => {
  //console.log(JSON.stringify(err));

  let customError = {
    // set default
    statusCode: err.statusCode || 500,
    msg: err.message || "Something went wrong. Please try again later",
  };

  if (err.name === "ValidationError") {
    const details = [];
    Object.values(err.errors).forEach((value) => {
      details.push(value.message);
    });
    const msg =
      "One or more of the values you've entered has failed verification.";
    customError.msg = { msg, details };
    customError.statusCode = 400;
  }

  if (err.name === "TokenExpiredError") {
    customError.msg = "Your token has expired. Please try again. ";
    customError.statusCode = 401;
  }

  if (err.name === "JsonWebTokenError") {
    customError.msg = "Invalid token. ";
    customError.statusCode = 400;
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    customError.msg =
      "You are limited to uploading a maximum of 5 files in each upload.";
    customError.statusCode = 400;
  }
  if (err.code === 11000) {
    customError.statusCode = 409;
    customError.msg = "";
    for (const [key, value] of Object.entries(err.keyValue)) {
      customError.msg += `The following ${key} ('${value}') is already in use. `;
    }
  }
  return res.status(customError.statusCode).json({ error: customError.msg });
};

module.exports = errorHandlerMiddleware;
