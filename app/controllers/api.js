const global = require('../scripts/global');
const $ = require('jquery');

exports.indicators = (callback) => {
  if (global.indicators) return callback(null, global.indicators);
  return $
    .ajax({
      url: '/api/indicators',
      success(indicators) {
        global.indicators = indicators;
        return callback(null, indicators);
      },
      error(err) {
        return callback(err);
      },
    });
};

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
