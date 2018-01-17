const indicatorController = require('../indicator');
const utils = require('../utils');
/**
 * GET /
 * Home page.
 */

exports.index = async (req, res, next) => {
  try {
    const indicators = await indicatorController.list();
    const data = utils.getGlobalData(req.user);
    data.title = 'Indicator Evidence Summaries';
    data.indicators = indicators;
    data.selectedId = req.params.id;
    data.breadcrumbs.push({ label: 'Indicator Evidence Summaries', path: '/evidence' });
    return res.render('indicators', data);
  } catch (err) {
    return next(err);
  }
};

