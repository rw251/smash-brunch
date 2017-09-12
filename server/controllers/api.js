const practiceController = require('./practice');
const dateController = require('./date');

exports.listPractices = (req, res, next) => {
  practiceController.list((err, practices) => {
    if (err) return next(err);
    return res.send(practices);
  });
};

exports.listDates = (req, res, next) => {
  dateController.list((err, dates) => {
    if (err) return next(err);
    return res.send(dates);
  });
};

exports.listDatesForDisplay = (req, res, next) => {
  dateController.listForDisplay((err, dates) => {
    if (err) return next(err);
    return res.send(dates);
  });
};
