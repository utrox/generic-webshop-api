const User = require("../models/User");
const bcrypt = require("bcrypt");
const path = require("path");
const attachAuthCookie = require("../utils/attachAuthCookie");
const sendRecoveryEmail = require("../utils/send-mail");
const sleep = require("../utils/sleep");

const recoveryInstructionsHTML = path.join(
  __dirname,
  "..",
  "recoveryInstructions.html"
);

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
  const payload = { userID: user._id, role: user.role };
  const token = user.generateJWT(payload);
  // TODO remove comment from attachAuthCookie for "production" version
  attachAuthCookie(res, token);
  res.status(200).json({ msg: "Logged in successfully." });
};

const logout = async (req, res) => {
  // TODO if secure is set to true, the cookie doesn't show up in Postman. Remove for "production" version
  res.cookie("token", "", {
    maxAge: 1,
    signed: true,
    /* secure: true, */ httpOnly: true,
  });
  return res.status(200).send("Logged out successfully.");
};

const register = async (req, res) => {
  // deconstruct it, so the user can't pass in "role": "admin" and grand themselves admin authorization.
  const { username, email, password } = req.body;
  if (!password || password.length < 6 || password.length > 12) {
    return res
      .status(400)
      .json({ msg: "Password must be between 6 and 12 characters long." });
  }
  const newUser = await User.create({ username, email, password });
  const payload = { userID: newUser._id, role: newUser.role };
  const token = newUser.generateJWT(payload);
  // TODO remove comment from attachAuthCookie for "production" version
  attachAuthCookie(res, token);
  return res.status(201).json({ msg: "user successfully created" });
};

const requestRecovery = async (req, res) => {
  const { email } = req.body;
  const account = await User.findOne({ email });
  // avoid data-leak
  if (!account) {
    console.log("email not found.");
    await sleep(1500);
    return res
      .status(200)
      .send("Recovery email sent. It expires in 10 minutes. //fake");
  }
  const recoveryToken = account.generateRecoveryToken();
  account.recoveryToken = recoveryToken;
  await account.save();
  const payload = {
    userID: account.id,
    recoveryToken,
  };
  const jwtToken = account.generateJWT(payload);
  sendRecoveryEmail(email, account.username, jwtToken);
  return res.status(200).send("Recovery email sent. It expires in 10 minutes.");
};

const recovery = async (req, res) => {
  const { password, confirmPassword } = req.body;
  console.log(password, confirmPassword);

  res.send("recovery route");
};

const recoveryInstructions = async (req, res) => {
  res.sendFile(recoveryInstructionsHTML);
};

module.exports = {
  login,
  logout,
  register,
  recovery,
  requestRecovery,
  recoveryInstructions,
};
