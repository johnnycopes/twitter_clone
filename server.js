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
mongoose.set('debug', true);
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

app.get('/api/global', (req, res) => {
  Tweet.find({}).sort('-timestamp')
    .then((response) => {
      console.log("Success");
      console.log(response);
      res.json({response: response})
    })
    .catch((err) => {
      console.log("Failed:", err.message);
      console.log(err.errors);
      res.status('401').json({error: err.message})
    });
  });


// Login page

app.post('/api/login', (req, res) => {
  // Contains key-value pairs of data dsubmitted in the request body
  let userInfo = req.body;

  // Dig into the db for that sweet, sweet info
  User.findById(userInfo.username)
    .then((response) => {
      return bcrypt.compare(userInfo.password, response.password);
    })
    .then(() => {
      let token = uuid();
      let username = userInfo.username;
      let expiration = new Date;
      expiration.setDate(expiration.getDate() + 30);
      return Token.create({
        user_id: username,
        token: token,
        timestamp: expiration
      });
    })
    .then((loginData) => {
      res.json({info: loginData});
    })
    .catch((err) => {
      console.log("Failed:", err.message);
      console.log(err.errors);
      res.status('401').json({error: err.message})
    });
});


// Profile page

// Load page based on userID
app.get('/api/profile/:userID', (req, res) => {
  let username = req.params.userID
  // Get user's tweets and followers/following
  bluebird.all([
    Tweet.find({user_id: username}).sort('-timestamp'),
    User.findById(username)
  ]).spread(function(tweets, user) {
    res.json({
      tweets: tweets,
      user: user
    })
  });
});

app.post('/api/modifyFollowStatus', (req, res) => {
  let usersInfo = req.body;
  // Follow target user
  console.log(usersInfo);
  console.log(usersInfo.isFollowing);
  if (!usersInfo.isFollowing) {
    bluebird.all([
      User.findByIdAndUpdate(
        { _id: usersInfo.userToFollow }, // (value of _id in db)
        { $push: {followers: usersInfo.userLoggedIn} } // (value to update)
      ),
      User.findByIdAndUpdate(
        { _id: usersInfo.userLoggedIn },
        { $push: {following: usersInfo.userToFollow} }
      )
      ]).spread((user) => {
        res.json(user);
      })
      .catch(function(err) {
        console.error('Error!');
        console.log(err);
        res.status(401).json({status: "Failed", error: err.message, stack: err.stack});
      });
  }
  else {
    bluebird.all([
      User.update(
        { _id: usersInfo.userToFollow }, // (value of _id in db)
        { $pull: {followers: usersInfo.userLoggedIn} } // (value to update)
      ),
      User.update(
        { _id: usersInfo.userLoggedIn },
        { $pull: {following: usersInfo.userToFollow} }
      )
      ]).spread((user) => {
        res.json(user);
      })
      .catch(function(err) {
        console.error('Error!');
        console.log(err);
        res.status(401).json({status: "Failed", error: err.message, stack: err.stack});
      });
  }
});


// Signup page

app.post('/api/signup', (req, res) => {
  // Contains key-value pairs of data submitted in the request body
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
      res.status(401).json({status: "Failed", error: err.message, stack: err.stack});
    });
});


// Individual timeline

app.get('/api/timeline', (req, res) => {
  let username = req.query.username;
  User.findById(username)
    .then((response) => {
      let following = response.following.concat([username]);
      return Tweet.find({
        user_id: {
          $in: following
        }
      }).sort('-timestamp');
    })
    .then((response) => {
      res.json({response: response});
    })
    .catch((err) => {
      console.log("Failed:", err.message);
      console.log(err.errors);
      res.status('401').json({error: err.message})
    });
});


// Post a tweet

app.post('/api/timeline', (req, res) => {
  let userInfo = req.body;
  Tweet.create({
    user_id: userInfo.user_id, // refers to user model id (the username)
    text: userInfo.text,
    timestamp: new Date
  })
  .then((response) => {
    // reload state after successful post
    res.json(response);
    console.log('good on the back-end');
  })
  .catch((err) => {
    console.log("Failed:", err.message);
    console.log("Failed:", err.errors);
    res.status('401').json({error: err.message})
  });
});



app.listen(3000, function() {
  console.log('listening on *:3000');
});
