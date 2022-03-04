const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  let token;
  // check for token in header, if there's none, check for it in the cookies.
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else token = req.signedCookies.token;

  // if the user is not authenticated, send error response.
  if (!token) return res.status(403).send("You must be logged in to do that.");

  const verifiedToken = await jwt.verify(token, process.env.JWT_SECRET);
  req.user = verifiedToken.payload;

  next();
};

const checkAdminPermission = (req, res, next) => {
  // if the user's role is not admin, send error message
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ msg: "You are unauthorized to access this route." });
  }
  next();
};

module.exports = { authMiddleware, checkAdminPermission };
