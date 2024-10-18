const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const database = require('./config/database');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('./config/passport');


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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

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
  failureRedirect: '/login',
  failureFlash: true // just added to display error msg
}));

app.get('/success', (req, res) => {
  res.send('Login successful!');
});

//Logout Route (/logout):

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

// Success Route (/success):

app.get('/success', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.send('Login successful!');
});

// Home Route (/):

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.htm');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Ohanz Server listening on port ${port}`);
});

