const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const OAuth2GoogleStrategy = require('passport-google-oauth20').Strategy;
const MongoClient = require('mongodb').MongoClient;
const config = require('../config');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((sessionUser, done) => {
  done(null, sessionUser);
});

// /**
//  * Sign in using Email and Password.
//  */
// passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
//   User.findOne({ email: email.toLowerCase() }, (err, user) => {
//     if (err) { return done(err); }
//     if (!user) {
//       return done(null, false, { msg: `Email ${email} not found.` });
//     }
//     if (user.authenticate(password)) {
//       return done(null, user);
//     }
//     return done(null, false, { msg: 'Invalid email or password.' });
//   });
// }));

/*
  Use oauth2 - google for now but will change to own provider
*/
passport.use(new OAuth2GoogleStrategy({
  clientID: config.oauth2.clientId,
  clientSecret: config.oauth2.clientSecret,
  callbackURL: 'http://localhost:3333/auth/google/callback',
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  scope: ['email'],
}, (accessToken, refreshToken, profile, cb) => {
  // profile.emails [ { value:'email...', verified:true} ]
  if (!profile.emails || profile.emails.length === 0) return cb(null, false, { msg: 'No email address associated with that account.' });
  const validEmails = profile.emails.filter(v => v.verified).map(v => v.value);
  if (validEmails.length === 0) return cb(null, false, { msg: 'No valid email address associated with that account.' });
  return User.findOne({ email: { $in: validEmails } }, (err, user) => {
    if (err) { return cb(err); }
    if (!user) {
      const newUser = new User({
        email: validEmails[0],
        name: profile.displayName,
      });
      newUser.save((errSave) => {
        if (errSave) return cb(errSave);
        return cb(null, newUser);
      });
    }
    return cb(null, user);
  });
}));


/**
 * Login Required middleware.
 */

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */

exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find(tkn => tkn.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
