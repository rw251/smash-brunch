const utils = require('./utils');
/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  const data = utils.getGlobalData(req.user);
  data.title = 'All Practices';
  data.breadcrumbs.push({ label: 'All Practices', path: '/ccg' });
  res.render('ccg', data);
};

