const crypto = require('crypto');
const mongoose = require('mongoose');

const validatePresenceOf = value => value.length;

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
  practices: {
    type: Array,
    default: [],
  },
}, { timestamps: true });

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
