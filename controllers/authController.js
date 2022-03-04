const User = require("../models/User");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const attachAuthCookie = require("../utils/attachAuthCookie");
const { sendVerifyEmail, sendRecoveryEmail } = require("../utils/send-mail");
const sleep = require("../utils/sleep");
const customError = require("../utils/customError");

const recoveryInstructionsHTML = path.join(
  __dirname,
  "..",
  "recoveryInstructions.html"
);

const register = async (req, res) => {
  const { username, email, password } = req.body;

  const newUser = await User.create({ username, email, password });

  const activationToken = newUser.activationToken;
  sendVerifyEmail(email, username, activationToken);

  return res.status(201).json({
    msg: "Account successfully created. Please verify your email adress before proceeding.",
  });
};

const activateAccount = async (req, res) => {
  const { activationToken } = req.body;

  const account = await User.findOne({ activationToken });

  if (!account) {
    throw new customError("Invalid activation token.", 400);
  }

  account.activationToken = "";
  account.isActive = true;
  await account.save();

  res.json({
    msg: "Your account's been activated. Now you can proceed to log in.",
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    throw new customError("Wrong credentials.", 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new customError("Wrong credentials.", 401);
  }

  if (!user.isActive) {
    throw new customError(
      "The account has not been activated yet. Please check your email inbox.",
      401
    );
  }

  const token = await user.createLoginJWT();

  attachAuthCookie(res, token);
  res.status(200).json({ msg: "Logged in successfully.", token });
};

const logout = async (req, res) => {
  res.cookie("token", "", {
    maxAge: 1,
    signed: true,
    /* secure: true, */ httpOnly: true,
  });
  return res.status(200).json({ msg: "Logged out successfully." });
};

const requestRecovery = async (req, res) => {
  const { email } = req.body;
  const account = await User.findOne({ email });
  // avoid data-leak
  if (!account) {
    console.log("email not found in db.");
    await sleep(1000);
    return res
      .status(200)
      .json({ msg: "Recovery email sent. It expires in 10 minutes." });
  }

  const recoveryJWT = await account.generateRecoveryToken(account.id);
  sendRecoveryEmail(email, account.username, recoveryJWT);
  return res
    .status(200)
    .json({ msg: "Recovery email sent. It expires in 10 minutes." });
};

const recovery = async (req, res) => {
  const unverifiedToken = req.body.recoveryJWT;
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
  res.status(200).json({ msg: "Password changed successfully." });
};


module.exports = {
  login,
  logout,
  register,
  recovery,
  requestRecovery,
  activateAccount,
};
