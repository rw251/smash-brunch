const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

/**
 * Validations
 */
const validatePresenceOf = function validatePresenceOf(value) {
  // If you are authenticating by any of the oauth strategies, don't validate.
  return (this.provider && this.provider !== 'local') || value.length;
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: [validatePresenceOf, 'Name cannot be blank'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email'],
    validate: [validatePresenceOf, 'Email cannot be blank'],
  },
  roles: {
    type: Array,
    default: ['authenticated'],
  },
  hashed_password: {
    type: String,
    validate: [validatePresenceOf, 'Password cannot be blank'],
  },
  password_recovery_code: {
    type: String,
  },
  password_recovery_expiry: {
    type: Date,
  },
  provider: {
    type: String,
    default: 'local',
  },
  salt: String,
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  linkedin: {},

  practices: { type: Array },
}, { timestamps: true });

/**
 * Virtuals
 */
userSchema.virtual('password').set(function (password) {
  this.pswrd = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.hashPassword(password);
}).get(function () {
  return this.pswrd;
});

/**
 * Methods
 */
userSchema.methods = {

  /**
   * HasRole - check if the user has required role
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  hasRole(role) {
    const roles = this.roles;
    return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
  },

  /**
   * IsAdmin - check if the user is an administrator
   *
   * @return {Boolean}
   * @api public
   */
  isAdmin() {
    return this.roles.indexOf('admin') !== -1;
  },

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate(plainText) {
    return this.hashPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Hash password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  hashPassword(password) {
    if (!password || !this.salt) return '';
    const salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },
};
/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  return bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    return bcrypt.hash(user.password, salt, null, (errHash, hash) => {
      if (errHash) { return next(errHash); }
      user.password = hash;
      return next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */

userSchema.methods.comparePassword = function comparePassword(candidatePassword, hashedPassword, cb) {
  bcrypt.compare(candidatePassword, hashedPassword, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */

userSchema.methods.gravatar = function gravatar(size = 200) {
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
