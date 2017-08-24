exports.getUserObject = user => ({
  global: {
    authenticated: user,
    isAdmin: user.isAdmin(),
    user,
  },
});
