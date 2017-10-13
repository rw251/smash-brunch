const passport = require('passport');
const OAuth2GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../config');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((sessionUser, done) => {
  done(null, sessionUser);
});

/*
  Use oauth2 - google for now but will change to own provider
*/
passport.use(new OAuth2GoogleStrategy({
  clientID: config.oauth2.clientId,
  clientSecret: config.oauth2.clientSecret,
  callbackURL: `${config.ourURL}/auth/google/callback`,
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
