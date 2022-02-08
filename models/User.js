const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const returnHash = require("../utils/return-hash");

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
  // hash the password before saving to the database if it's a new entry. When editing existing entries this ensures that the password doesn't get hashed again.
  if (this.isNew) {
    this.password = await returnHash(this.password);
  } else if (this.modifiedPaths().includes("recoveryToken")) {
    // when saving a recoveryToken, hashing it like a password seems like good practice
    this.recoveryToken = await returnHash(this.recoveryToken);
  }
  next();
});

UserSchema.methods.generateJWT = (payload) => {
  return jwt.sign({ payload }, process.env.JWT_SECRET);
};

UserSchema.methods.generateRecoveryToken = () => {
  return crypto.randomBytes(16).toString("hex");
};

module.exports = mongoose.model("User", UserSchema);
