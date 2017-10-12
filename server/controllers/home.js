const practiceController = require('./practice');
const dateController = require('./date');
const utils = require('./utils');

exports.index = async (req, res, next) => {
  try {
    const practices = await practiceController.list();
    const dates = await dateController.listForDisplay();
    const data = utils.getGlobalData(req.user);
    data.title = 'Single Practice';
    data.practices = practices;
    data.dates = dates;
    data.selectedId = req.params.id;
    data.selectedDateId = req.params.dateId;
    return res.render('home', data);
  } catch (err) {
    return next(err);
  }
};
