const indicatorController = require('../indicator');
const dateController = require('../date');
const utils = require('../utils');
/**
 * GET /
 * Home page.
 */

exports.index = async (req, res, next) => {
  try {
    const indicators = await indicatorController.list();
    const dates = await dateController.listForDisplay();
    const data = utils.getGlobalData(req.user);
    data.title = 'All Practices';
    data.indicators = indicators;
    data.dates = dates;
    data.selectedId = req.params.id;
    data.selectedDateId = req.params.dateId;
    data.breadcrumbs.push({ label: 'All Practices', path: '/ccg' });
    return res.render('ccg', data);
  } catch (err) {
    return next(err);
  }
};

