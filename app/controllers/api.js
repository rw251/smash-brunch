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

exports.ccgAllIndicatorData = (dateId, callback) => {
  if (!global.ccgData) global.ccgData = {};
  if (!global.ccgData.all) global.ccgData.all = {};
  if (global.ccgData.all[dateId]) {
    return callback(null, global.ccgData.all[dateId]);
  }
  return $
    .ajax({
      url: `/api/indicator/all/summaryfordate/${dateId}`,
      success(data) {
        global.ccgData.all[dateId] = data;
        return callback(null, data);
      },
      error(err) {
        return callback(err);
      },
    });
};

exports.practiceData = (practiceId, dateId, comparisonDateId, callback) => {
  if (!global.practiceData) global.practiceData = {};
  if (!global.practiceData[practiceId]) global.practiceData[practiceId] = {};
  if (!global.practiceData[practiceId][dateId]) global.practiceData[practiceId][dateId] = {};
  if (global.practiceData[practiceId][dateId][comparisonDateId]) {
    return callback(null, global.practiceData[practiceId][dateId][comparisonDateId]);
  }
  return $
    .ajax({
      url: `/api/practice/${practiceId}/summaryfordate/${dateId}/comparedWith/${comparisonDateId}`,
      success(data) {
        global.practiceData[practiceId][dateId][comparisonDateId] = data;
        return callback(null, data);
      },
      error(err) {
        return callback(err);
      },
    });
};
