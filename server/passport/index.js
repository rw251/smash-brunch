/* eslint no-underscore-dangle: ["error", { "allow": ["_json"] }] */
/* _json comes from github so have to make it an exception for eslint */

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const Auth0Strategy = require('passport-auth0');
const config = require('../config');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  if (user.email) return done(null, [user.email]);
  else if (user.emails && user.emails.length > 0) return done(null, user.emails.map(v => v.value));
  return done(new Error('No email address on that account'));
});

passport.deserializeUser((emails, done) => {
  User.findOne({ email: { $in: emails } }, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
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

/**
 * Sign in with auth0
 */
passport.use(new Auth0Strategy({
  domain: config.auth0.domain,
  clientID: config.auth0.clientId,
  clientSecret: config.auth0.clientSecret,
  callbackURL: config.auth0.callbackUrl,
}, (accessToken, refreshToken, extraParams, profile, done) => {
  console.log(accessToken, refreshToken, extraParams, profile);
  // User.findOne({ email: email.toLowerCase() }, (err, user) => {
  //   if (err) { return done(err); }
  //   if (!user) {
  //     return done(null, false, { msg: `Email ${email} not found.` });
  //   }
  //   if (user.authenticate(password)) {
  //     return done(null, user);
  //   }
  //   return done(null, false, { msg: 'Invalid email or password.' });
  // });
  return done(null, profile);
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
