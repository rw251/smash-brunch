const dateController = require('../date');
const indicatorController = require('../indicator');
const utils = require('../utils');

exports.index = async (req, res, next) => {
  try {
    const indicators = await indicatorController.list();
    const dates = await dateController.listForDisplay();
    const data = utils.getGlobalData(req.user);
    data.title = 'Indicator';
    data.practiceId = req.params.practiceId;
    data.dateId = req.params.dateId;
    data.comparisonDateId = req.params.comparisonDateId;
    data.reportType = req.params.reportType;
    data.indicatorId = req.params.indicatorId;
    data.indicators = indicators;
    data.dates = dates;
    data.breadcrumbs.push({ label: 'Indicator', path: '/practice' });
    return res.render('indicator', data);
  } catch (err) {
    return next(err);
  }
};
