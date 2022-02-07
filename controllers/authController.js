const User = require("../models/User");
const bcrypt = require("bcrypt");
const attachAuthCookie = require("../middlewares/attachAuthCookie");

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ msg: "Wrong credentials." });
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ msg: "Wrong credentials." });
  }
  const payload = { userID: user._id };
  const token = newUser.generateJWT(payload);
  // TODO remove comment from attachAuthCookie for "production" version
  attachAuthCookie(res, token);
  res.status(200).send("ok");
};

const logout = async (req, res) => {
  // TODO if secure is set to true, the cookie doesn't show up in Postman. Remove for "production" version
  res.cookie("token", "", {
    maxAge: 1,
    signed: true,
    /* secure: true, */ httpOnly: true,
  });
  return res.status(200).send("");
};

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!password || password.length < 6 || password.length > 12) {
    return res
      .status(400)
      .json({ msg: "Password must be between 6 and 12 characters long." });
  }
  const newUser = await User.create({ username, email, password });
  const payload = { userID: newUser._id };
  const token = newUser.generateJWT(payload);
  // TODO remove comment from attachAuthCookie for "production" version
  attachAuthCookie(res, token);
  return res.status(201).json({ msg: "user successfully created" });
};

module.exports = { login, logout, register };
