const forgotPasswordTemplate = require('../../shared/templates/auth/forgot.jade');
const changePasswordTemplate = require('../../shared/templates/auth/changePassword.jade');
const loginTemplate = require('../../shared/templates/auth/login.jade');
const global = require('../scripts/global');
const defaultController = require('./default');

exports.login = () => {
  global.serverOrClientLoad()
    .onClient((ready) => {
      defaultController(loginTemplate);
      ready();
    })
    .onServer();
};

exports.forgot = () => {
  defaultController(forgotPasswordTemplate);
};

exports.changePassword = () => {
  global.serverOrClientLoad()
    .onClient((ready) => {
      defaultController(changePasswordTemplate);
      ready();
    })
    .onServer();
};
