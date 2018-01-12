const page = require('page');
const homeController = require('../controllers/home');
const ccgController = require('../controllers/ccg');
const indicatorsController = require('../controllers/indicators');
const helpController = require('../controllers/help');
const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const notfound = require('../controllers/404');
const ctrl = require('../../shared/controllers');
const { routes } = require('../../shared/routes')({ get: page });
const validateControllers = require('../../shared/validate');
const utils = require('./utils');

const controllers = {};
controllers[ctrl.home] = homeController;
controllers[ctrl.ccg] = ccgController;
controllers[ctrl.evidence] = indicatorsController;
controllers[ctrl.help] = helpController;
controllers[ctrl.user] = userController;
controllers[ctrl.auth] = authController;

validateControllers(controllers);

const passThroughToServer = (ctx) => {
  if (ctx.handled) return;
  const current = window.location.pathname + window.location.search; // get requested url

  // don't navigate if the same - might need to remove this
  if (current === ctx.canonicalPath) return;
  page.stop(); // stop page routing
  ctx.handled = false;
  window.location.href = ctx.canonicalPath; // do redirect to hit server
};

const getRoutesWithoutAuthentication = routes.filter(route => !route.needsAuth && route.type === 'get');
const getRoutesWithAuthentication = routes.filter(route => route.needsAuth && route.type === 'get');

const wireUpRoute = (route) => {
  const middleware = [];
  middleware.push(utils.updateSelectedTab);
  middleware.push(utils.showLoadingShade);
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
// page('/auth/google', passThroughToServer);

/*
 * everything else checks if logged in.
 */
page('*', utils.isLoggedIn);

/**
 * wire up all authenticated routes
 */
getRoutesWithAuthentication.forEach(wireUpRoute);

/*
 *  Everything else display the 404
 */
page('*', notfound);

module.exports = page;
