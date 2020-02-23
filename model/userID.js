var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newUser = new Schema({
  username: String
});

const userModel = mongoose.model("userid", newUser);

module.exports = userModel;
