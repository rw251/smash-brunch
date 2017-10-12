const page = require('page');
const homeController = require('../controllers/home');
const ccgController = require('../controllers/ccg');
const indicatorsController = require('../controllers/indicators');
const helpController = require('../controllers/help');
const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const notfound = require('../controllers/404');
const global = require('../scripts/global');
const ctrl = require('../../shared/controllers');
const routes = require('../../shared/routes');
const validateControllers = require('../../shared/validate');
const $ = require('jquery');

const controllers = {};
controllers[ctrl.home] = homeController;
controllers[ctrl.ccg] = ccgController;
controllers[ctrl.evidence] = indicatorsController;
controllers[ctrl.help] = helpController;
controllers[ctrl.user] = userController;
controllers[ctrl.auth] = authController;

validateControllers(controllers);

// clearly this can be spoofed in the client, but all data
// requests go via the api which authenticates server side.
const isLoggedIn = (ctx, next) => {
  if (global.isLoggedIn) next();
  else page.redirect('/login');
};

const updateSelectedTab = (ctx, next) => {
  $('.navbar-nav li').removeClass('active');
  $(`.navbar-nav li a[href="/${ctx.pathname.split('/')[1]}"]`).parent().addClass('active');
  next();
};

const passThroughToServer = (ctx) => {
  if (ctx.handled) return;
  const current = location.pathname + location.search; // get requested url

  if (current === ctx.canonicalPath) return; // don't navigate if the same - might need to remove this
  page.stop(); // stop page routing
  ctx.handled = false;
  location.href = ctx.canonicalPath; // do redirect to hit server
};

const getRoutesWithoutAuthentication = routes.filter(route => !route.needsAuth && route.type === 'get');
const getRoutesWithAuthentication = routes.filter(route => route.needsAuth && route.type === 'get');

const wireUpRoute = (route) => {
  const middleware = [];
  middleware.push(updateSelectedTab);
  middleware.push(controllers[route.controller][route.method]);

  // for each route pass the array of middlewares spread out
  page(route.url, ...middleware);
};

/**
 * routes that don't need authentication
 */
getRoutesWithoutAuthentication.forEach(wireUpRoute);

/*
 *  The following need to hit the server.
 */
page('/logout', passThroughToServer);
page('/auth/google', passThroughToServer);

/*
 * everything else checks if logged in.
 */
page('*', isLoggedIn);

/**
 * wire up all authenticated routes
 */
getRoutesWithAuthentication.forEach(wireUpRoute);

/*
 *  Everything else display the 404
 */
page('*', notfound);

module.exports = page;
