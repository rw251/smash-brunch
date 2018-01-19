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

exports.ccgSingleIndicatorData = (indicatorId, dateId, comparisonDateId, callback) => {
  if (!global.ccgData) global.ccgData = {};
  if (!global.ccgData[indicatorId]) global.ccgData[indicatorId] = {};
  if (!global.ccgData[indicatorId][dateId]) global.ccgData[indicatorId][dateId] = {};
  if (global.ccgData[indicatorId][dateId][comparisonDateId]) {
    return callback(null, global.ccgData[indicatorId][dateId][comparisonDateId]);
  }
  return $
    .ajax({
      url: `/api/indicator/${indicatorId}/summaryfordate/${dateId}/comparedWith/${comparisonDateId}`,
      success(data) {
        global.ccgData[indicatorId][dateId][comparisonDateId] = data;
        return callback(null, data);
      },
      error(err) {
        return callback(err);
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
  if (!global.practiceData[practiceId][dateId][comparisonDateId]) {
    global.practiceData[practiceId][dateId][comparisonDateId] = {};
  }
  if (global.practiceData[practiceId][dateId][comparisonDateId].overview) {
    return callback(null, global.practiceData[practiceId][dateId][comparisonDateId].overview);
  }
  return $
    .ajax({
      url: `/api/practice/${practiceId}/summaryfordate/${dateId}/comparedWith/${comparisonDateId}`,
      success(data) {
        global.practiceData[practiceId][dateId][comparisonDateId].overview = data;
        return callback(null, data);
      },
      error(err) {
        return callback(err);
      },
    });
};

exports.patientData = (practiceId, dateId, comparisonDateId, indicatorId, reportType, callback) => {
  if (!global.practiceData) global.practiceData = {};
  if (!global.practiceData[practiceId]) global.practiceData[practiceId] = {};
  if (!global.practiceData[practiceId][dateId]) global.practiceData[practiceId][dateId] = {};
  if (!global.practiceData[practiceId][dateId][comparisonDateId]) {
    global.practiceData[practiceId][dateId][comparisonDateId] = {};
  }
  if (!global.practiceData[practiceId][dateId][comparisonDateId][indicatorId]) {
    global.practiceData[practiceId][dateId][comparisonDateId][indicatorId] = {};
  }
  if (global.practiceData[practiceId][dateId][comparisonDateId][indicatorId][reportType]) {
    return callback(
      null,
      global.practiceData[practiceId][dateId][comparisonDateId][indicatorId][reportType]
    );
  }
  return $
    .ajax({
      url: `/api/patients/${practiceId}/${dateId}/${comparisonDateId}/${indicatorId}/${reportType}`,
      success(data) {
        global.practiceData[practiceId][dateId][comparisonDateId][indicatorId][reportType] = data;
        return callback(null, data);
      },
      error(err) {
        return callback(err);
      },
    });
};

exports.patientMultipleData = (practiceId, dateId, callback) => {
  if (!global.practiceData) global.practiceData = {};
  if (!global.practiceData[practiceId]) global.practiceData[practiceId] = {};
  if (!global.practiceData[practiceId][dateId]) global.practiceData[practiceId][dateId] = {};
  if (global.practiceData[practiceId][dateId].multiple) {
    return callback(null, global.practiceData[practiceId][dateId].multiple);
  }
  return $
    .ajax({
      url: `/api/patients/${practiceId}/multiple/on/${dateId}`,
      success(data) {
        global.practiceData[practiceId][dateId].multiple = data;
        return callback(null, data);
      },
      error(err) {
        return callback(err);
      },
    });
};
