const express = require('express');
const homeController = require('../controllers/home');
const ccgController = require('../controllers/ccg');
const indicatorsController = require('../controllers/indicators');
const helpController = require('../controllers/help');
const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const apiController = require('../controllers/api');
const routes = require('../../shared/routes');
const ctrl = require('../../shared/controllers');
const validateControllers = require('../../shared/validate');
const passport = require('passport');
const config = require('../config');

require('../passport/index');

const controllers = {};
controllers[ctrl.home] = homeController;
controllers[ctrl.ccg] = ccgController;
controllers[ctrl.evidence] = indicatorsController;
controllers[ctrl.help] = helpController;
controllers[ctrl.user] = userController;
controllers[ctrl.auth] = authController;

validateControllers(controllers);

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()) { return next(); }
    // if the user is not authenticated then redirect him to the login page
  req.session.redirect_to = req.path; // remember the page they tried to load
  return res.redirect('/login');
};
const isAdmin = (req, res, next) => {
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

// Perform the login
  router.get('/login2', passport.authenticate('auth0', {
    clientID: config.auth0.clientId,
    domain: config.auth0.domain,
    redirectUri: config.auth0.callbackUrl,
    audience: `https://${config.auth0.domain}/userinfo`,
    responseType: 'code',
    scope: 'openid profile email',
  }), (req, res) => {
    res.redirect('/');
  });

// // Perform the final stage of authentication and redirect to '/user'
  router.get('/callback', passport.authenticate('auth0', {
    failureRedirect: '/',
  }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
  });

  // api methods for returning JSON data to populate some views
  router.get('/api/users', isAuthenticated, isAdmin, userController.listJSON);
  router.get('/api/users/:email', isAuthenticated, isAdmin, userController.getJSON);
  router.get('/api/practices', isAuthenticated, apiController.listPractices);
  router.get('/api/dates', isAuthenticated, apiController.listDates);
  router.get('/api/datesForDisplay', isAuthenticated, apiController.listDatesForDisplay);

  router.get('/logout', authController.logout);

  router.get('/', isAuthenticated, (req, res) => {
    res.redirect('/practice');
  });

  router.get('*', isAuthenticated, (req, res, next) => {
    next();
  });

  return router;
};
