const forgotPasswordTemplate = require('../../shared/templates/auth/forgot.jade');
const changePasswordTemplate = require('../../shared/templates/auth/changePassword.jade');
const loginTemplate = require('../../shared/templates/auth/login.jade');
const defaultController = require('./default');
const global = require('../scripts/global');
const auth0 = require('auth0-js');

const wireUpLogin = () => {
  /*window.addEventListener('load', () => {
    const webAuth = new auth0.WebAuth({
      domain: 'action.eu.auth0.com',
      clientID: 'oD3MJsfVxT05pz8xEaE2nPtAs5pTyWjv',
      responseType: 'token id_token',
      audience: 'https://action.eu.auth0.com/userinfo',
      scope: 'openid',
      redirectUri: window.location.href,
    });

    const loginBtn = document.getElementById('btn-login');

    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      webAuth.authorize();
    });
  }); */
};

exports.login = () => {
  if (global.server) {
    delete global.server;
    console.log('server load');
    wireUpLogin();
  } else {
    console.log('client load');
    defaultController(loginTemplate);
    wireUpLogin();
  }
};

exports.forgot = () => {
  defaultController(forgotPasswordTemplate);
};

exports.changePassword = () => {
  defaultController(changePasswordTemplate);
};
