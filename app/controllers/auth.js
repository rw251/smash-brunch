const forgotPasswordTemplate = require('../../shared/templates/auth/forgot.jade');
const changePasswordTemplate = require('../../shared/templates/auth/changePassword.jade');
const loginTemplate = require('../../shared/templates/auth/login.jade');
const defaultController = require('./default');

exports.login = () => {
  if (global.server) {
    delete global.server;
    console.log('server load');
  } else {
    console.log('client load');
    defaultController(loginTemplate);
  }
};

exports.forgot = () => {
  defaultController(forgotPasswordTemplate);
};

exports.changePassword = () => {
  defaultController(changePasswordTemplate);
};
