const express = require('express');
const passportConfig = require('../passport/index');
const homeController = require('../controllers/home');
const ccgController = require('../controllers/page2');
const indicatorsController = require('../controllers/page3');
const helpController = require('../controllers/page4');
const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const routes = require('../../shared/routes');
const ctrl = require('../../shared/controllers');
const validateControllers = require('../../shared/validate');

const controllers = {};
controllers[ctrl.home] = homeController;
controllers[ctrl.ccg] = ccgController;
controllers[ctrl.evidence] = indicatorsController;
controllers[ctrl.help] = helpController;
controllers[ctrl.user] = userController;
controllers[ctrl.auth] = authController;

validateControllers(controllers);

const router = express.Router();

const isAuthenticated = function (req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()) { return next(); }
    // if the user is not authenticated then redirect him to the login page
  req.session.redirect_to = req.path; // remember the page they tried to load
  return res.redirect('/login');
};
const isAdmin = function (req, res, next) {
  if (req.user.roles.indexOf('admin') > -1) return next();
  return res.redirect('/login');
};

module.exports = function routeIndex() {
  routes.forEach((route) => {
    // router.type=get/post etc
    const middleware = [];

    // add any middlewares like isAuth, isAdmin etc..
    if (route.needsAuth) middleware.push(isAuthenticated);
    if (route.needsAdmin) middleware.push(isAdmin);

    // add the actual controller action
    middleware.push(controllers[route.controller][route.method]);

    // set up the route
    router[route.type](route.url, ...middleware);
  });

  // api methods for returning JSON data to populate some views
  router.get('/api/users', isAuthenticated, isAdmin, userController.listJSON);
  router.get('/api/users/:email', isAuthenticated, isAdmin, userController.getJSON);

  router.get('/logout', authController.logout);

  router.get('*', isAuthenticated, (req, res, next) => {
    next();
  });

  return router;
};
