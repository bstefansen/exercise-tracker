var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newExercise = new Schema(
  {
    userid: String,
    description: String,
    duration: Number,
    date: String
  },
  {
    versionKey: false
  }
);



const exerciseModel = mongoose.model("exercise", newExercise);

module.exports = exerciseModel;
