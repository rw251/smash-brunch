const userListTemplate = require('../../shared/templates/account/listUsers.jade');
const userAddTemplate = require('../../shared/templates/account/addUser.jade');
const userEditTemplate = require('../../shared/templates/account/editUser.jade');
const userDeleteTemplate = require('../../shared/templates/account/deleteUser.jade');
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

exports.add = () => {
  defaultController(userAddTemplate);
};

exports.delete = (ctx) => {
  defaultController(userDeleteTemplate, { email: ctx.params.email });
};

exports.edit = (ctx) => {
  $.ajax({
    url: `/api/users/${ctx.params.email}`,
    success(user) {
      defaultController(userEditTemplate, { user });
    },
    error() {
      defaultController(userEditTemplate, { user: { roles: [] }, message: { error: 'Somethings\'s gone wrong' } });
    },
  });
};
