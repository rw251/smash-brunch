const $ = require('jquery');
const page = require('page');
const global = require('../scripts/global');

// clearly this can be spoofed in the client, but all data
// requests go via the api which authenticates server side.
exports.isLoggedIn = (ctx, next) => {
  if (global.isLoggedIn) next();
  else page.redirect('/login');
};

exports.updateSelectedTab = (ctx, next) => {
  $('.navbar-nav li').removeClass('active');
  $(`.navbar-nav li a[href="/${ctx.pathname.split('/')[1]}"]`).parent().addClass('active');
  next();
};

exports.showLoadingShade = (ctx, next) => {
  global.setShowLoading(true);
  setTimeout(() => {
    if (global.getShowLoading()) {
      $('.loading-shade').show();
    }
  }, 500);
  setTimeout(() => {
    next();
  }, 1);
};