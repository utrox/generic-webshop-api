const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const returnHash = require("../utils/return-hash");
const customError = require("../utils/customError");
const createJWT = require("../utils/create-jwt");

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
    isActive: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
      default: crypto.randomBytes(64).toString("hex"),
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
    // check if password's valid
    if (this.password.length < 6 || this.password.length > 12) {
      throw new customError(
        "Password must be between 6 and 12 characters long.",
        400
      );
    }
    this.password = await returnHash(this.password);
  }
  if (this.isNew) {
  }
  next();
});

UserSchema.methods.createLoginJWT = async function () {
  console.log(this);
  const payload = { userID: this._id, role: this.role };
  return createJWT(payload, { expiresIn: "24h" });
};

UserSchema.methods.generateRecoveryToken = async function (userID) {
  // generate random recovery token
  const recoveryToken = crypto.randomBytes(16).toString("hex");
  // hash and store it in the database
  console.log(recoveryToken);
  this.recoveryToken = await returnHash(recoveryToken);
  await this.save();
  // generate JWT and return it.
  const jwtToken = this.createJWT(
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
