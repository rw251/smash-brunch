/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  res.render('page2', {
    title: 'Page 2 Long Title',
    user: req.user,
    server: true,
    global: {
      authenticated: req.user,
      isAdmin: req.user.isAdmin(),
      user: req.user,
    },
  });
};

