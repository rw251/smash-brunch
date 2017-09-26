const compression = require('compression');
const express = require('express');
const expressValidator = require('express-validator');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const path = require('path');
const forceSsl = require('express-force-ssl');
const logger = require('express-pino-logger');
const pino = require('pino')();
const bodyParser = require('body-parser');
const passport = require('passport');
const expressSession = require('express-session');
const flash = require('flash');
const config = require('./server/config');
const mongoose = require('mongoose');
const http = require('http');

const DEBUG = true;

const routes = require('./server/routes/index')(passport);

module.exports = function brunchServer(PORT, PATH, CALLBACK) {
  const app = express();
  app.use(compression()); // enable gzip compression

  mongoose.set('debug', DEBUG);
  mongoose.Promise = global.Promise;
  mongoose.connect(config.mongoUrl, { useMongoClient: true });
  mongoose.connection.on('error', (err) => {
    pino.error(err);
    pino.info('MongoDB connection error. Please make sure MongoDB is running.');
    process.exit();
  });

  let port = PORT || config.server.port;
  if (!port) port = config.server.port || '3333';
  app.set('port', port);
  app.set('views', [path.join(__dirname, 'server/views')]);// , path.join(__dirname, 'shared/views')]);
  app.set('view engine', 'pug');
  // app.use(expressStatusMonitor());
  // app.use(compression());

  if (process.env.NODE_ENV === 'production') {
    console.log('ATTEMPTING FORCESSL');
    app.use(forceSsl);
  }

  // app.use(favicon(path.join(__dirname, PATH, 'favicon.ico')));
  app.use(logger());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(expressValidator());
  app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: config.passport.secret,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  // So that on heroku it recognises requests as https rather than http
  app.enable('trust proxy');

  app.use('/js', express.static(path.join(__dirname, PATH, 'js')));
  app.use('/css', express.static(path.join(__dirname, PATH, 'css')));
  app.use('/fonts', express.static(path.join(__dirname, PATH, 'fonts')));
  app.use('/html', express.static(path.join(__dirname, PATH, 'html')));
  app.use('/img', express.static(path.join(__dirname, PATH, 'img')));

  // dedicated routes for service worker and manifest
  app.use('/service-worker', express.static(path.join(__dirname, PATH, 'sw.js')));
  app.use('/manifest', express.static(path.join(__dirname, PATH, 'manifest.json')));

  app.use('/', routes);

  app.use(express.static(path.join(__dirname, PATH)));

  // catch 404 and respond accordingly
  app.use((req, res) => {
    pino.info('A 404 request');
    pino.info(req.headers);
    res.status(404);

      // respond with html page
    if (req.accepts('html')) {
      res.render('404', { url: req.url,
        user: req.user,
        global: {
          authenticated: req.user,
          isAdmin: req.user && req.user.roles && req.user.roles.indexOf('admin') > -1,
          user: req.user,
        } });
      return;
    }

      // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }

      // default to plain-text. send()
    res.type('txt').send('Not found');
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use((err, req, res) => {
      res.status(err.status || 500);
      res.render('pages/error.jade', {
        message: err.message,
        error: err,
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('pages/error.jade', {
      message: err.message,
      error: {},
    });
  });


  /**
   * Create HTTP server.
   */

  const server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  /**
   * Event listener for HTTP server "error" event.
   */

  const onError = function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        pino.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        pino.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  };

  /**
   * Event listener for HTTP server "listening" event.
   */

  const onListening = function onListening() {
    CALLBACK();
  };

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
};
