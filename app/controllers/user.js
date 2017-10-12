const userListTemplate = require('../../shared/templates/account/listUsers.jade');
const userAddTemplate = require('../../shared/templates/account/addUser.jade');
const userEditTemplate = require('../../shared/templates/account/editUser.jade');
const userDeleteTemplate = require('../../shared/templates/account/deleteUser.jade');
const global = require('../scripts/global');
const api = require('./api');
const defaultController = require('./default');
const $ = require('jquery');

// params, state, url
exports.list = () => {
  $.ajax({
    url: '/api/users',
    success(users) {
      defaultController(userListTemplate, { users });
    },
    error() {
      defaultController(userListTemplate, { users: [], message: { error: 'Somethings\'s gone wrong' } });
    },
  });
};

const wireUpAdd = () => {
  $('.selectpicker').selectpicker();
};

exports.add = () => {
  if (global.server) {
    delete global.server;
    console.log('server load');
    wireUpEdit();
  } else {
    console.log('client load');
    api.practices((err, practices) => {     
      if (err) {
        defaultController(userAddTemplate, {message: { error: 'Somethings\'s gone wrong' } });
      } else {
        defaultController(userAddTemplate, {practices});
        wireUpAdd();
      }
    });    
  }
};

exports.delete = (ctx) => {
  defaultController(userDeleteTemplate, { email: ctx.params.email });
};

const wireUpEdit = () => {
  $('.selectpicker').selectpicker();
};

exports.edit = (ctx) => {
  if (global.server) {
    delete global.server;
    console.log('server load');
    wireUpEdit();
  } else {
    console.log('client load');
    api.practices((err, practices) => {
      api.user(ctx.params.email, (userError, user) => {
        if (userError) {
          defaultController(userEditTemplate, { user: { roles: [] }, message: { error: 'Somethings\'s gone wrong' } });
        } else {
          defaultController(userEditTemplate, { user, practices });
          wireUpEdit();
        }
      });
    });
  }
};
