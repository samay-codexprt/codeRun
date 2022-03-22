const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");
const userController = require("./controller/user");
const axios = require("axios");
const app = express();
app.use(express.json());

mongoose.connect(
  "mongodb://127.0.0.1:27017/userSchema",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("mongodb is connected");
  }
);

app.use("/api/user", userController);

app.listen(7000, () => {
  console.log("port is listen on 7000");
});
