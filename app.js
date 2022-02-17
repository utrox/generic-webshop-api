// require packages
require("dotenv").config();
// express-async-errors middleware is used so the errors don't crash the whole server.
require("express-async-errors");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

//middlewares
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

//import routers
const productRouter = require("./routers/productRouter");
const reviewRouter = require("./routers/reviewRouter");
const authRouter = require("./routers/authRouter");

//routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/auth", authRouter);

app.route("/").get((req, res) => {
  res.send("api is running");
});


// errorhandler and notfound middlewares
const errorHandlerMiddleware = require("./middlewares/error-handler");
const notFoundMiddleware = require("./middlewares/not-found");
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

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
