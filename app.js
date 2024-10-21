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


// app.post('/login', passport.authenticate('local', {
//   successRedirect: '/success',
//   failureRedirect: '/login',
//   failureFlash: true // just added to display error msg
// }));

// Modified app.js: Added session to authenticate user
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.session.userId = user._id;
      res.redirect('/success');
    });
  })(req, res, next);
});


// app.get('/success', (req, res) => {
//   res.send('Login successful!');
// });

app.get('/success', checkAuthentication, (req, res) => {
  // res.send('Login successful!'); Legacy
  res.sendFile(__dirname + '/public/success.htm');
});


//Logout Route (/logout):

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    // res.redirect('/');
    // res.status(302).redirect('/');
    // res.set("Cache-Control", "no-cache, no-store");
    // res.redirect('/');
    // res.set("Cache-Control", "no-cache, no-store");
    // res.set("Expires", "-1");
    // res.status(302).redirect('/');
    // res.clearCookie('connect.sid', { path: '/' }); // Adjust cookie name
    res.clearCookie(req.session.cookie.name, { path: '/' });
    res.status(200).send('Logged out successfully'); // Adjust response
  });
});

function checkAuthentication(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}
// Success Route (/success):

// app.get('/success', (req, res) => {
//   if (!req.session.userId) {
//     return res.redirect('/login');
//   }
//   res.send('Login successful!');
// });

// Home Route (/):

//   app.get('/home', checkAuthentication, (req, res) => { 
//     // res.sendFile(__dirname + '/public/home.htm');
//   const userId = req.session.userId;
//   User.findById(userId, (err, user) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Error fetching user data');
//     } else {
//       res.redirect(`/home?username=${user.username}&email=${user.email}`);
//     }
//   });
// });
// app.get('/home', checkAuthentication, async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const user = await User.findById(userId, 'name email'); // exclude sensitive fields
//     if (!user) {
//       res.status(404).send('User not found');
//     } else {
//       res.json({ user: user });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching user data');
//   }
// });

app.get('/home', checkAuthentication, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId, 'name email');
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    res.redirect(`/homepage?name=${user.name}&email=${user.email}`);
  } catch (error) {
    // console.error(error);
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/homepage', (req, res) => {
  // res.sendFile(__dirname + '/public/home.htm');
  try {
    const { name, email } = req.query;

    if (!name || !email) {
      res.status(400).send('Invalid query parameters');
      return;
    }

    res.sendFile(__dirname + '/public/home.htm');
  } catch (error) {
    console.error('Error serving homepage:', error);
    res.status(500).send('Internal Server Error');
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Ohanz Server listening on port ${port}`);
});

