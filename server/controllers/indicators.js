const utils = require('./utils');
/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  const data = utils.getGlobalData(req.user);
  data.title = 'Indicator Evidence Summaries';
  res.render('indicators', data);
};

