const User = require('../models/User');

/**
 * List all users
 */

const getUserObject = user => ({
  global: {
    authenticated: user,
    isAdmin: user.isAdmin(),
    user,
  },
});

const listOfUsers = (callback) => {
  User.find({}, (err, users) => {
    if (err) { return callback(err); }
    return callback(null, users);
  });
};

const getUser = (email, callback) => {
  User.findOne({ email }, (err, user) => {
    if (err) { return callback(err); }
    return callback(null, user);
  });
};

exports.listJSON = (req, res, next) => {
  listOfUsers((err, users) => {
    if (err) { return next(err); }
    return res.send(users);
  });
};

exports.list = (req, res, next) => {
  listOfUsers((err, users) => {
    if (err) { return next(err); }
    const userObject = getUserObject(req.user);
    userObject.title = 'Users';
    userObject.users = users;
    return res.render('account/listUsers', userObject);
  });
};

exports.getJSON = (req, res, next) => {
  getUser(req.params.email, (err, user) => {
    if (err) { return next(err); }
    return res.send(user);
  });
};

exports.add = (req, res) => {
  const userObject = getUserObject(req.user);
  userObject.title = 'Users';
  res.render('account/addUser', userObject);
};

exports.postAdd = (req, res) => {
  const userObject = getUserObject(req.user);
  User.findOne({
    email: req.body.email,
  }, (err, user) => {
    if (err) {
      console.log(`Error in SignUp: ${err}`);
      req.flash('danger', 'Error while calling db to check if account already exists.');
      return res.render('account/addUser', userObject);
    }
    if (user) {
      console.log(`User already exists with email: ${req.body.email}`);
      req.flash('danger', 'An account with that email address already exists.');
      return res.render('account/addUser', userObject);
    }
    // if there is no user with that email
    // create the user
    const roles = ['authenticated'];
    if (req.body.isAdmin) roles.push('admin');
    if (req.body.isCCG) roles.push('ccg');

    const newUser = new User({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      roles,
    });

    // save the user
    return newUser.save((saveErr) => {
      if (saveErr) {
        console.log(`Error in Saving user: ${saveErr}`);
        req.flash('danger', 'Error saving new user.');
        return res.render('account/addUser', userObject);
      }
      console.log('User Registration succesful');
      return res.redirect('/users');
    });
  });
};

exports.edit = (req, res, next) => {
  const userObject = getUserObject(req.user);
  userObject.title = 'Users';
  getUser(req.params.email, (err, user) => {
    if (err) { return next(err); }
    userObject.user = user;
    return res.render('account/editUser', userObject);
  });
};

exports.postEdit = (req, res) => {
  const userObject = getUserObject(req.user);
  const email = req.params.email;
  User.findOne({ email }, (err, user) => {
    // In case of any error, return using the done method
    if (err) {
      console.log(`Error in SignUp: ${err}`);
      req.flash('danger', 'Error while calling db to find user.');
      return res.render('account/editUser', userObject);
    }
    // doesn't exist
    if (!user) {
      console.log(`Attempting to edit an unknown user: ${email}`);
      req.flash('danger', 'Attempting to edit an unknown user.');
      return res.render('account/editUser', userObject);
    }
    userObject.user = user;
    const roles = ['authenticated'];
    if (req.body.isAdmin) roles.push('admin');
    if (req.body.isCCG) roles.push('ccg');
    const originalUser = user;

    if (email === req.body.email) {
        // email not changing so update is fine
      user.name = req.body.name;
      user.roles = roles;
        // save the user
      user.save((saveErr) => {
        if (saveErr) {
          console.log(`Error in Saving user: ${saveErr}`);
          req.flash('danger', 'Error saving new user.');
          return res.render('account/editUser', userObject);
        }
        return res.redirect('/users');
      });
    } else {
        // check no existing user with that email
      User.findOne({
        email: req.body.email,
      }, (findErr, existingUser) => {
        if (findErr) {
          console.log(`Error while checking if new email appears in system: ${err}`);
          req.flash('danger', 'Error while checking if new email appears in system.');
          return res.render('account/editUser', userObject);
        }
          // if there is already a user with the modified email address
        if (existingUser) {
          console.log(`Trying to change the email to one that already appears in the system: ${email}`);
          req.flash('danger', 'Trying to change the email to one that already appears in the system.');
          return res.render('account/editUser', userObject);
        }
        originalUser.email = req.body.email;
        originalUser.name = req.body.name;
        originalUser.roles = roles;
            // save the user
        originalUser.save((saveErr) => {
          if (saveErr) {
            console.log(`Error in Saving user: ${saveErr}`);
            req.flash('danger', 'Error saving new user.');
            return res.render('account/editUser', userObject);
          }
          console.log('User Registration succesful');
          return res.redirect('/users');
        });
      });
    }
  });
};

exports.delete = (req, res) => {
  const userObject = getUserObject(req.user);
  userObject.email = req.params.email;
  res.render('account/deleteUser', userObject);
};

exports.postDelete = (req, res) => {
  User.find({ email: req.params.email }).remove(() => {
    res.redirect('/users');
  });
};

