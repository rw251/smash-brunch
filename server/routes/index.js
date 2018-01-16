const express = require('express');
const homeController = require('../controllers/home');
const ccgController = require('../controllers/ccg');
const evidenceSummaryController = require('../controllers/evidenceSummaries');
const helpController = require('../controllers/help');
const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const apiController = require('../controllers/api');
const sharedRoutes = require('../../shared/routes');
const cors = require('cors');
const ctrl = require('../../shared/controllers');
// const passport = require('passport');
const validateControllers = require('../../shared/validate');

require('../passport/index');

const controllers = {};
controllers[ctrl.home] = homeController;
controllers[ctrl.ccg] = ccgController;
controllers[ctrl.evidence] = evidenceSummaryController;
controllers[ctrl.help] = helpController;
controllers[ctrl.user] = userController;
controllers[ctrl.auth] = authController;

validateControllers(controllers);

const { router, routes } = sharedRoutes(express.Router());

const isAuthenticated = (req, res, next) => {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()) { return next(); }

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

  router.get('/cookie/:cookie', cors({ origin: true, credentials: true }), (req, res) => {
    res.cookie('sid', req.params.cookie).send({ ta: 'very much' });
  });
  router.get('/resetcookie', cors({ origin: true, credentials: true }), (req, res) => {
    res.clearCookie('sid').send({ all: 'done' });
  });

  // api methods for returning JSON data to populate some views
  router.get('/api/users', isAuthenticated, isAdmin, userController.listJSON);
  router.get('/api/users/:email', isAuthenticated, isAdmin, userController.getJSON);
  router.get('/api/practices', isAuthenticated, apiController.listPractices);
  router.get('/api/indicators', isAuthenticated, apiController.listIndicators);
  router.get('/api/dates', isAuthenticated, apiController.listDates);
  router.get('/api/datesForDisplay', isAuthenticated, apiController.listDatesForDisplay);

  router.get('/api/practice/:practiceId/summaryfordate/:dateId/comparedWith/:comparisonDateId', isAuthenticated, apiController.getPracticeData);
  router.get('/api/practice/:practiceId/summaryfordate/:dateId/comparedWith/:comparisonDateId/export', isAuthenticated, apiController.exportPracticeData);

  router.get('/api/indicator/all/summaryfordate/:dateId', isAuthenticated, apiController.getAllIndicatorData);
  // router.get('/api/indicator/:indicatorId/summaryfordate/:dateId/comparedWith
  // /:comparisonDateId', isAuthenticated, apiController.get)
  // router.get('/auth/google', passport.authenticate('google'));
  // router.get('/auth/google/callback', passport.authenticate('google',
  // { failureRedirect: '/login' }), (req, res) => {
  //   // Successful authentication, redirect to original url or home.
  //   let red = req.session.redirect_to || '/practice';
  //   if (req.body.hash) red += `#${req.body.hash}`;
  //   req.session.redirect_to = null;
  //   delete req.session.redirect_to;
  //   return res.redirect(red);
  // });

  router.get('/logout', authController.logout);

  router.get('/', isAuthenticated, (req, res) => {
    res.redirect('/practice');
  });

  router.get('*', isAuthenticated, (req, res, next) => {
    next();
  });

  return router;
};
