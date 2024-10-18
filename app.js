const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const database = require('./config/database');
const bcrypt = require('bcryptjs');

// Passport.js configuration
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  User.findOne({ email: email }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Invalid email or password.' });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
}));

// Database connection
database.connect();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport.js middleware
app.use(passport.initialize());

// Public folder
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.htm');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.htm');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.htm');
});

// app.post('/register', (req, res) => {
//   const { name, email, password } = req.body;
//   const newUser = new User({ name, email, password });
//   bcrypt.hash(newUser.password, 10, (err, hash) => {
//     if (err) { throw err; }
//     newUser.password = hash;
//     newUser.save((err) => {
//       if (err) { throw err; }
//       res.send('User created successfully!');
//     });
//   });
// });
// callback() resolve
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.send('User created successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});


app.post('/login', passport.authenticate('local', {
  successRedirect: '/success',
  failureRedirect: '/login'
}));

app.get('/success', (req, res) => {
  res.send('Login successful!');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Ohanz Server listening on port ${port}`);
});

