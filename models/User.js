const mongoose = require("mongoose");

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
});

module.exports = mongoose.model("User", UserSchema);
