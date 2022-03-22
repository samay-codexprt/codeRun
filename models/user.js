const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  userName: {
    type: String,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
  },
  code: {
    type: String,
  },
  uuid: {
    type: String,
  },
});
module.exports = mongoose.model("User", userSchema);
