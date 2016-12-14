// ========================
// INITIAL SETUP
// ========================

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
mongoose.Promise = bluebird;

mongoose.connect('mongodb://localhost/twitter_clone');

app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());


// ========================
// DATABASE SETUP
// ========================

const userSchema = new mongoose.Schema({
  _id: String, // username
  password: String,
  following: [String],
  followers: [String]
});

const tweetSchema = new mongoose.Schema({
  user_id: String, // refers to user model id (the username)
  text: String,
  timestamp: Date
});

const User = mongoose.model('User', userSchema);
const Tweet = mongoose.model('Tweet', tweetSchema);


function getProfile(username, req, res) {
  User.findById(username)
    .then((results) => {
      console.log('Success!');
      console.log(results);
      res.json({status: "Success", response: results});
    })
    .catch((err) => {
      console.log('Failed:', err.message);
      console.log(err.errors);
      res.json({status: "Failed", error: err.message})
    });
}


// ========================
// ROUTES
// ========================

// General timeline

app.get('/global', (req, res) => {
  Tweet.find({})
    .then((response) => {
      console.log("Success");
      console.log(response);
      res.json({status: "OK", response: response})
    })
    .catch((err) => {
      console.log("Failed:", err.message);
      console.log(err.errors);
      res.json({status: "Failed", error: err.message})
    });
  });


// Profile page

app.get('/profile', (req, res) => {
  // console.log(req);
  let username = req.query.username;
  getProfile('eliastheredbearded', req, res);
  // console.log(res);
});


// Individual feed

app.get('/feed', (req, res) => {
  let username = req.query.username;
  User.findById(username)
    .then((results) => {
      let following = results.following.concat([username]);
      return Tweet.find({
        user_id: {
          $in: following
        }
      }).sort('timestamp');
    })
    .then((results) => {
      res.json({status: 'Succesful!', results: results});
    })
    .catch((err) => {
      console.log("Failed:", err.message);
      console.log(err.errors);
      res.json({status: "Failed", error: err.message})
    });
});





app.listen(3000, function() {
  console.log('listening on *:3000');
});
