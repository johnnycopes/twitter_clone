const mongoose = require('mongoose');
const bluebird = require('bluebird');
mongoose.Promise = bluebird;

mongoose.connect('mongodb://localhost/cats_db');

const catSchema = new mongoose.Schema({
  name: String,
  age: Number,
  temperament: String
});

const Cat = mongoose.model('Cat', catSchema);


// ==============================
// add a new cat to the database


// make it, then save it (2 steps)

// let george = new Cat({
//   name: 'Mrs. Norris',
//   age: 7,
//   temperament: 'evil'
// });

// george.save()
//   .then(function(result) {
//     console.log('Success!');
//     console.log(result);
//   })
//   .catch(function(err) {
//     console.log('Failed: ', err.message);
//     console.log(err.errors);
//   });


// create and save at the same time (1 step)

Cat.create({
  name: 'Butters',
  age: 15,
  temperament: 'bland'
})
.then(function(cat) {
  console.log('Success!');
  console.log(cat);
})
.catch(function(err) {
  console.log('Failed: ', err.message);
  console.log(err.errors);
});


// ==============================
// retrieve all cats from the db and print each one

Cat.find({})
  .then(function(cats) {
    console.log('Success!');
    console.log(cats);
  })
  .catch(function(err) {
    console.log('Failed: ', err.message);
    console.log(err.errors);
  });
