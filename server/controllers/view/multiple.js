const dateController = require('../date');
const utils = require('../utils');

exports.index = async (req, res, next) => {
  try {
    const dates = await dateController.listForDisplay();
    const data = utils.getGlobalData(req.user);
    data.title = 'Multiple';
    data.practiceId = req.params.practiceId;
    data.dateId = req.params.dateId;
    data.dates = dates;
    data.breadcrumbs.push({ label: 'Multiple', path: '/practice' });
    return res.render('multiple', data);
  } catch (err) {
    return next(err);
  }
};
