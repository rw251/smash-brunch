const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const config = require('../config');

/**
 * GET /login
 * Login page.
 */

exports.login = (req, res) => {
  if (req.user) return res.redirect('/');
  return res.render('auth/login', { title: 'Login' });
};

/**
 * POST /login
 * Sign in using email and password.
 */

exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('danger', errors[0].msg);
    return res.redirect('/login');
  }

  return passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('danger', info && info.msg ? info.msg : 'Unknown error occurred');
      return res.redirect('/login');
    }
    return req.logIn(user, (errLogin) => {
      if (errLogin) { return next(errLogin); }
      let red = req.session.redirect_to || '/';
      if (req.body.hash) red += `#${req.body.hash}`;
      req.session.redirect_to = null;
      delete req.session.redirect_to;
      return res.redirect(red);
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * GET /reset/:token
 * Reset Password page.
 */

exports.reset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  return User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('danger', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      return res.render('auth/reset', {
        title: 'Password Reset',
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */

exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('danger', errors[0].msg);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((userFromDb) => {
        const user = userFromDb;
        if (!user) {
          req.flash('danger', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save().then(() => new Promise((resolve, reject) => {
          req.logIn(user, (errLogin) => {
            if (errLogin) { return reject(errLogin); }
            return resolve(user);
          });
        }));
      });

  const sendResetPasswordEmail = (user) => {
    if (!user) { return; }
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: config.email.username,
        pass: config.email.password,
      },
    });
    const mailOptions = {
      to: user.email,
      from: config.email.fromPasswordReset,
      subject: 'Your SMASH password has been changed',
      text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n\n
      If you have not just changed your password then please contact the support team at ${config.email.support}.\n`,
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        // req.flash('success', 'Success! Your password has been changed.');
      })
      .catch((err) => {
        console.log(err);
        req.flash('danger', 'An error has occurred. Please try again.');
      });
  };

  return resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => { if (!res.finished) res.redirect('/'); })
    .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */

exports.forgot = (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/');
  return res.render('auth/forgot', { title: 'Forgot Password' });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */

exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('danger', errors[0].msg);
    return res.redirect('/forgot');
  }

  const createRandomToken = crypto
    .randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .then((userFromDb) => {
        let user = userFromDb;
        if (!user) {
          req.flash('info', `An e-mail has been sent to ${req.body.email} with further instructions.`);
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

  const sendForgotPasswordEmail = (user) => {
    if (!user) { return; }
    const token = user.passwordResetToken;
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: config.email.username,
        pass: config.email.password,
      },
    });
    const mailOptions = {
      to: user.email,
      from: user.email.fromPasswordResetLink,
      subject: 'Reset your SMASH password',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        https://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please contact the support team at ${config.email.support}.\n`,
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('info', `An e-mail has been sent to ${user.email} with further instructions.`);
      })
      .catch((err) => {
        console.log(err);
        req.flash('danger', 'An error has occurred and the email has not been sent. Please try again.');
      });
  };

  return createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot'))
    .catch(next);
};


/**
 * GET /signup
 * Signup page.
 */

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.render('auth/signup', {
    title: 'Create Account',
  });
};

/**
 * POST /signup
 * Create a new local auth.
 */

exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('danger', errors[0].msg);
    return res.redirect('/signup');
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  return User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('danger', 'Account with that email address already exists.');
      return res.redirect('/signup');
    }
    return user.save((errUserSave) => {
      if (errUserSave) { return next(errUserSave); }
      return req.logIn(user, (errLogin) => {
        if (errLogin) {
          return next(errLogin);
        }
        return res.redirect('/');
      });
    });
  });
};

/**
 * GET /auth
 * Profile page.
 */

exports.getAccount = (req, res) => {
  res.render('auth/profile', {
    title: 'Account Management',
    user: req.user,
  });
};

/**
 * POST /auth/profile
 * Update profile information.
 */

exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('danger', errors[0].msg);
    return res.redirect('/auth');
  }

  return User.findById(req.user.id, (err, userFromDb) => {
    const user = userFromDb;
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    return user.save((errSave) => {
      if (errSave) {
        if (errSave.code === 11000) {
          req.flash('danger', 'The email address you have entered is already associated with an account.');
          return res.redirect('/auth');
        }
        return next(errSave);
      }
      return res.redirect('/auth');
    });
  });
};

/**
 * POST /auth/password
 * Update current password.
 */

exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('danger', errors[0].msg);
    return res.redirect('/auth');
  }

  return User.findById(req.user.id, (err, userFromDb) => {
    const user = userFromDb;
    if (err) { return next(err); }
    user.password = req.body.password;
    return user.save((errSave) => {
      if (errSave) { return next(errSave); }
      return res.redirect('/auth');
    });
  });
};

/**
 * POST /auth/delete
 * Delete user account.
 */

exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    return res.redirect('/');
  });
};

