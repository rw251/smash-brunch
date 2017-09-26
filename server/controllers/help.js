const utils = require('./utils');
/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  const data = utils.getGlobalData(req.user);
  data.title = 'Contact / Help';
  res.render('help', data);
};

