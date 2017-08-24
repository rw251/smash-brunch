/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  res.render('help', {
    title: 'Contact / Help',
    user: req.user,
    global: {
      authenticated: req.user,
      isAdmin: req.user.isAdmin(),
      user: req.user,
    },
  });
};

