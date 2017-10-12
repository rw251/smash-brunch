const global = require('../scripts/global');
const $ = require('jquery');

exports.practices = (callback) => {
  if (global.practices) return callback(null, global.practices);
  return $
    .ajax({
      url: '/api/practices',
      success(practices) {
        global.practices = practices;
        return callback(null, practices);
      },
      error(err) {
        return callback(err);
      },
    });
};

exports.datesForDisplay = (callback) => {
  if (global.datesForDisplay) return callback(null, global.datesForDisplay);
  return $
    .ajax({
      url: '/api/datesForDisplay',
      success(datesForDisplay) {
        global.datesForDisplay = datesForDisplay;
        return callback(null, datesForDisplay);
      },
      error(err) {
        return callback(err);
      },
    });
};

exports.user = (email, callback) => {
  $.ajax({
    url: `/api/users/${email}`,
    success(user) {
      callback(null, user);
    },
    error() {
      callback(new Error('Can\'t find user.'));
    },
  });
};
