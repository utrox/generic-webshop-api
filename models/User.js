const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
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
});

UserSchema.pre("save", async function (next) {
  // hash the password before saving to the database if it's a new entry. When editing existing entries this ensures that the password doesn't get hashed again.
  if (this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.generateJWT = (payload) => {
  return jwt.sign({ payload }, process.env.JWT_SECRET);
};

module.exports = mongoose.model("User", UserSchema);
