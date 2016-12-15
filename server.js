// ========================
// INITIAL SETUP
// ========================

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
mongoose.Promise = bluebird;

mongoose.connect('mongodb://localhost/twitter_clone');

// When true, prints out every command sent to db in MongoDB format
mongoose.set('debug', true)

app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());


// ========================
// DATABASE SETUP
// ========================

const userSchema = new mongoose.Schema({
  _id: String, // username
  email: String,
  password: String,
  following: [String],
  followers: [String]
});

const tweetSchema = new mongoose.Schema({
  user_id: String, // refers to user model id (the username)
  text: String,
  timestamp: Date
});

const tokenSchema = new mongoose.Schema({
  user_id: String,
  token: String,
  timestamp: Date
})

const User = mongoose.model('User', userSchema);
const Tweet = mongoose.model('Tweet', tweetSchema);
const Token = mongoose.model('Token', tokenSchema);


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


// Log in page

app.post('/login', function(req, res) {
  // Contains key-value pairs of data dsubmitted in the request body
  let userInfo = req.body;

  // Dig into the db for that sweet info
  User.findById(userInfo.username)
    .then((response) => {
      console.log('response:',response);
      return bcrypt.compare(userInfo.password, response.password);
    })
    .then(() => {
      var token = uuid();
      var username = userInfo.username;
      var expiration = new Date;
      expiration.setDate(expiration.getDate() + 30);
      return Token.create({
        user_id: username,
        token: token,
        timestamp: expiration
      });
    })
    .then((login) => {
      res.status(200).json({status: 'Success', info: login});
    })
    .catch((err) => {
      console.log("Failed:", err.message);
      console.log(err.errors);
      res.json({status: "Failed", error: err.message})
    });

  // Encrypts the new user's password and stores it in a hash variable
  // bcrypt.hash(userInfo.password, 12)
  //   .then(function(hashedPassword) {
  //     return User.create({
  //       email: userInfo.email,
  //       _id: userInfo.username,
  //       password: hashedPassword
  //     });
  //   })
  //   .then(function() {
  //     res.status(200).json({status: "Success"});
  //   })
  //   .catch(function(err) {
  //     console.error('Error!');
  //     console.log(err);
  //     res.status(401).json({status: "Failed", error: err.message});
  //   });
});


// Profile page

app.get('/profile', (req, res) => {
  let username = req.query.username;
  User.findById(username)
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


// Signup page

app.post('/signup', function(req, res) {
  // Contains key-value pairs of data dsubmitted in the request body
  let userInfo = req.body;

  // Encrypts the new user's password and stores it in a hash variable
  bcrypt.hash(userInfo.password, 12)
    .then(function(hashedPassword) {
      return User.create({
        email: userInfo.email,
        _id: userInfo.username,
        password: hashedPassword
      });
    })
    .then(function() {
      res.status(200).json({status: "Success"});
    })
    .catch(function(err) {
      console.error('Error!');
      console.log(err);
      res.status(401).json({status: "Failed", error: err.message});
    });
});


// Individual timeline

app.get('/timeline', (req, res) => {
  let username = req.query.username;
  User.findById(username)
    .then((results) => {
      let following = results.following.concat([username]);
      return Tweet.find({
        user_id: {
          $in: following
        }
      }).sort('-timestamp');
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
