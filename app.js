// require packages
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");

//routes
app.route("/").get((req, res) => {
  res.send("HELLO");
});

// starting the server
const startServer = () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
