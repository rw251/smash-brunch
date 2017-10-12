const practiceController = require('./practice');
const dateController = require('./date');

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
