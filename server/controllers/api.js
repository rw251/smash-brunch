const practiceController = require('./practice');
const indicatorController = require('./indicator');
const dateController = require('./date');

exports.listIndicators = (req, res, next) => {
  indicatorController.list()
    .then(indicators => res.send(indicators))
    .catch(err => next(err));
};

exports.listPractices = (req, res, next) => {
  practiceController.list()
    .then(practices => res.send(practices))
    .catch(err => next(err));
};

exports.listDates = (req, res, next) => {
  dateController.list()
    .then(dates => res.send(dates))
    .catch(err => next(err));
};

exports.listDatesForDisplay = (req, res, next) => {
  dateController.listForDisplay()
    .then(dates => res.send(dates))
    .catch(err => next(err));
};
