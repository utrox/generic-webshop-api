const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.signedCookies.token;
  // if the user is not authenticated, send response.
  if (!token) {
    return res.status(403).send("You must be logged in to do that.");
  }
  const verifiedToken = await jwt.verify(token, process.env.JWT_SECRET);
  req.user = verifiedToken.payload;
  next();
};

module.exports = { authMiddleware };
