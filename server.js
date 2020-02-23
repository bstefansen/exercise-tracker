// Init project
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
const express = require("express");
const app = express();
var cors = require("cors");
var userModel = require("./model/userID.js");
var exerciseModel = require("./model/exercise.js");

// Basic Configuration
app.use(express.static(__dirname + "/public"));

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// POST username
app.post("/api/exercise/new-user", (req, res) => {
  var dataUser = new userModel({
    username: req.body.username
  });

  userModel.findOne({ username: req.body.username }, (err, data) => {
    if (data !== null) {
      res.send("username already taken");
    } else {
      dataUser.save(function(err) {
        if (err) return console.error(err);
      });

      return res.json(dataUser);
    }
  });
});

// POST exercise
app.post("/api/exercise/add", (req, res) => {
  var dateString = new Date(req.body.date).getTime(); /*.toDateString()*/
  var currentDate = new Date().getTime(); /*.toDateString()*/

  var dataExercise = new exerciseModel({
    userid: req.body.userid,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date == "" ? currentDate : dateString
  });

  userModel.findOne({ _id: req.body.userid }, (err, dataCheck) => {
    if (dataCheck === undefined) {
      res.send("unknown _id");
    } else if (isNaN(req.body.duration) === true) {
      res.send("duration is not a number");
    } else {
      dataExercise.save(function(err) {
        if (err) return console.error(err);
      });
      userModel.findOne({ _id: req.body.userid }, (err, dataUser) => {
        return res.json({ username: dataUser.username, dataExercise });
      });
    }
  });
});

// GET user array
app.get("/api/exercise/users", (req, res) => {
  userModel.find((err, data) => {
    res.json(data);
  });
});

// GET user log
app.use(
  "/api/exercise/log?",
  (req, res, next) => {
    req.userId = req.query.userId;
    req.limited = parseInt(req.query.limit);
    req.from = new Date(req.query.from).getTime();
    req.to = new Date(req.query.to).getTime();

    if (req.query.from === undefined || req.query.to === undefined) {
      exerciseModel
        .find(
          {
            userid: req.userId
          },
          (err, dataExercise) => {
            req.dataExercise = dataExercise;
            next();
          }
        )
        .limit(req.limited)
        .sort("-date");
    } else {
      exerciseModel
        .find(
          {
            userid: req.userId,
            date: {
              $gte: req.from,
              $lt: req.to
            }
          },
          (err, dataExercise) => {
            req.dataExercise = dataExercise;
            next();
          }
        )
        .limit(req.limited)
        .sort("-date");
    }
  },
  (req, res) => {
    userModel.findOne({ _id: req.userId }, (err, dataUser) => {
      res.json({
        username: dataUser.username,
        count: req.dataExercise.length,
        log: req.dataExercise
      });
    });
  }
);

// listen for requests
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
