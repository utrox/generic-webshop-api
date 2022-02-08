const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const returnHash = require("../utils/return-hash");
const customError = require("../utils/customError");

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      minlength: 3,
      maxlength: 20,
      required: [true, "Please provide username"],
      unique: [true, "Username already in use"],
      trim: true,
    },

    email: {
      type: String,
      maxlength: 40,
      required: [true, "Please provide email adress"],
      unique: [true, "Email adress already in use"],
      trim: true,
      // validate if it's a valid email adress or not.
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email adress",
      ],
    },

    password: {
      type: String,
      required: [true, "Please provide password"],
    },

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    recoveryToken: {
      type: String,
      required: false,
    },
  },
  { versionKey: false }
);

UserSchema.pre("save", async function (next) {
  // hash the password before saving to the database if it's a new entry, or has been changed. When editing existing entries this ensures that the password doesn't get hashed again.
  if (this.isNew || this.modifiedPaths().includes("password")) {
    if (this.password.length < 6 || this.password.length > 12) {
      console.log(this.password.length);
      throw new customError(
        "Password must be between 6 and 12 characters long.",
        400
      );
    }
    this.password = await returnHash(this.password);
  }
  next();
});

UserSchema.methods.generateJWT = (payload, options = {}) => {
  return jwt.sign({ payload }, process.env.JWT_SECRET, options);
};

UserSchema.methods.generateRecoveryToken = async function (userID) {
  // generate random recovery token
  const recoveryToken = crypto.randomBytes(16).toString("hex");
  // hash and store it in the database
  console.log(recoveryToken);
  this.recoveryToken = await returnHash(recoveryToken);
  this.save();
  // generate JWT and return it.
  const jwtToken = this.generateJWT(
    { userID, recoveryToken: recoveryToken },
    { expiresIn: "10m" }
  );
  return jwtToken;
};

UserSchema.methods.validateRecoveryToken = async function (recoveryToken) {
  const isValid = await bcrypt.compare(recoveryToken, this.recoveryToken);
  console.log(isValid);
  if (!isValid) {
    throw new customError("Invalid token.", 401);
  }
  this.recoveryToken = "";
  await this.save();
};

module.exports = mongoose.model("User", UserSchema);
