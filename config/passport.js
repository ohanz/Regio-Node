const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// passport.use(new LocalStrategy({
//   usernameField: 'email',
//   passwordField: 'password'
// }, (email, password, done) => {
//   User.findOne({ email: email }, (err, user) => {
//     if (err) { return done(err); }
//     if (!user) {
//       return done(null, false, { message: 'Invalid email or password.' });
//     }
//     bcrypt.compare(password, user.password, (err, isMatch) => {
//       if (err) { return done(err); }
//       if (isMatch) {
//         return done(null, user);
//       } else {
//         return done(null, false, { message: 'Invalid email or password.' });
//       }
//     });
//   });
// }));

// Updated Code with Additional Logging


passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    console.log(`Attempting login with email: ${email}`);
    const user = await User.findOne({ email });
    console.log(`User found: ${user}`);

    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`Password valid: ${isValidPassword}`);

    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    done(null, user);
  } catch (err) {
    console.error(err);
    done(err);
  }
}));

passport.serializeUser((user, done) => {
  console.log(`Serializing user ID: ${user._id}`);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log(`Deserializing user ID: ${id}`);
    const user = await User.findById(id);
    console.log(`User deserialized: ${user}`);
    done(null, user);
  } catch (err) {
    console.error(err);
    done(err);
  }
});


module.exports = passport;
