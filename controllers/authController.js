const User = require("../models/User");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const attachAuthCookie = require("../utils/attachAuthCookie");
const sendRecoveryEmail = require("../utils/send-mail");
const sleep = require("../utils/sleep");
const customError = require("../utils/customError");

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

  const recoveryJWT = await account.generateRecoveryToken(account.id);
  sendRecoveryEmail(email, account.username, recoveryJWT);
  return res.status(200).send("Recovery email sent. It expires in 10 minutes.");
};

const recovery = async (req, res) => {
  const unverifiedToken = req.params.token;
  const { newPassword, confirmNewPassword } = req.body;

  if (!newPassword || newPassword !== confirmNewPassword) {
    throw new customError(
      "Please ensure you're providing two matching passwords.",
      400
    );
  }

  // decodes and verifies the JWT
  const verifiedToken = await jwt.verify(
    unverifiedToken,
    process.env.JWT_SECRET
  );

  const { userID, recoveryToken } = verifiedToken.payload;
  const account = await User.findOne({ _id: userID });

  if (!account) {
    throw new customError("Invalid token.", 404);
  }

  // throws an error if the token is invalid
  await account.validateRecoveryToken(recoveryToken);

  account.password = newPassword;
  await account.save();
  res.status(200).send("Password has changed.");
};

// temporary solution instead of requiring a front-end
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
