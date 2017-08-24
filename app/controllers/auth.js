const forgotPasswordTemplate = require('../../shared/templates/auth/forgot.jade');
const loginTemplate = require('../../shared/templates/auth/login.jade');
const defaultController = require('./default');

exports.login = () => {
  defaultController(loginTemplate);
};

exports.forgot = () => {
  defaultController(forgotPasswordTemplate);
};
