/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  res.render('indicators', {
    title: 'Indicator Evidence Summaries',
    user: req.user,
    global: {
      authenticated: req.user,
      isAdmin: req.user.isAdmin(),
      user: req.user,
    },
  });
};

