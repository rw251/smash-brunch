/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  res.render('ccg', {
    title: 'All Practices',
    user: req.user,
    global: {
      authenticated: req.user,
      isAdmin: req.user.isAdmin(),
      user: req.user,
    },
  });
};

