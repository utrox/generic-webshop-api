// require packages
require("dotenv").config();
// express-async-errors middleware is used so the errors don't crash the whole server.
require("express-async-errors");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");

//middlewares
app.use(express.json());

//import routes
const productRouter = require("./routers/productRouter");

//routes
app.use("/api/v1/products", productRouter);

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
