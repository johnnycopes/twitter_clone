const mongoose = require('mongoose');
const bluebird = require('bluebird');
mongoose.Promise = bluebird;

mongoose.connect('mongodb://localhost/twitter_clone');

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

// ========================
// Making new users/tweets
// ========================

// User.create({
//   _id: 'eliastheredbearded',
//   password: 'savemejebus',
//   following: [],
//   followers: []
// })
// .then(function(results){
//   console.log('Success!');
//   console.log(results);
// })
// .catch(function(err) {
//   console.log('Failure: ', err.message);
//   console.log(err.errors);
// });

// Tweet.create({
//   user_id: 'robthefalcon',
//   text: 'Go Falcons, fuck the saints',
//   timestamp: new Date()
// })
// .then(function(results){
//   console.log('Success!');
//   console.log(results);
// })
// .catch(function(err) {
//   console.log('Failure: ', err.message);
//   console.log(err.errors);
// });


// ========================
// Different pages
// ========================

// General timeline

// Tweet.find({})
//   .then(function(results) {
//     console.log('Success!');
//     console.log(results);
//   })
//   .catch(function(err) {
//     console.log('Failed: ', err.message);
//     console.log(err.errors);
//   });


// Profile page

// function getProfile(username) {
//   User.findById(username)
//     .then(function(results) {
//       console.log('Success!');
//       console.log(results);
//     })
//     .catch(function(err) {
//       console.log('Failed: ', err.message);
//       console.log(err.errors);
//     });
// }
//
// getProfile('eliastheredbearded');


// Individual feed

// User.findById(username)
//   .then(function(results) {
//     console.log('Success!');
//     console.log(results);
//   })
//   .catch(function(err) {
//     console.log('Failed: ', err.message);
//     console.log(err.errors);
//   });

var username = 'robthefalcon'; // For test purposes

User.findById(username)
  .then(function(results) {
    var following = results.following.concat([username]);
    return Tweet.find({
      user_id: {
        $in: following
      }
    }).sort('timestamp');
  })
  .then(function(results) {

    console.log(results);
  })
  .catch(function(err) {
    console.log('Failed: ', err.message);
    console.log(err.errors);
  });
