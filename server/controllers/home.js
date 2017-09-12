const practiceController = require('./practice');
const dateController = require('./date');
const utils = require('./utils');

exports.index = (req, res, next) => {
  practiceController.list((err, practices) => {
    if (err) return next(err);
    return dateController.listForDisplay((errDate, dates) => {
      if (errDate) return next(errDate);
      const data = utils.getUserObject(req.user);
      data.title = 'Single Practice';
      data.practices = practices;
      data.dates = dates;
      data.selectedId = req.params.id;
      data.selectedDateId = req.params.dateId;
      return res.render('home', data);
    });
  });
};
