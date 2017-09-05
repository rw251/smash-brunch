/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  res.render('home', {
    title: 'Page 1 Long Title',
    user: req.user,
    server: true,
    global: {
      authenticated: req.user,
      isAdmin: req.user.isAdmin(),
      user: req.user,
    },
  });
};