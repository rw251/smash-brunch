/* eslint no-underscore-dangle: ["error", { "allow": ["_json"] }] */
/* _json comes from github so have to make it an exception for eslint */

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const CustomStrategy = require('passport-custom').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
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
 * Sign in using session id cookie.
 */
passport.use(new CustomStrategy((req, callback) => {
  if (req.cookies && req.cookies.sid) {
    return MongoClient.connect(config.mongoSessionUrl, (err, db) => {
      if (err) return callback(err);
      console.log('Connected correctly to server');
      return db.collection('sessions').findOne({ _id: req.cookies.sid }, (errFind, session) => {
        console.log(session);
        db.close();
        if (errFind) return callback(errFind);
        try {
          return callback(null, session.session.passport.user);
        } catch (e) {
          return callback();
        }
      });
    });
  }
  return callback();
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
