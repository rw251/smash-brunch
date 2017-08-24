const forgotPasswordTemplate = require('../../shared/templates/auth/forgot.jade');
const changePasswordTemplate = require('../../shared/templates/auth/changePassword.jade');
const loginTemplate = require('../../shared/templates/auth/login.jade');
const defaultController = require('./default');

exports.login = () => {
  defaultController(loginTemplate);
};

exports.forgot = () => {
  defaultController(forgotPasswordTemplate);
};

exports.changePassword = () => {
  defaultController(changePasswordTemplate);
};
