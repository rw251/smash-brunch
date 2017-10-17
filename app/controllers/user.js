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
  global.serverOrClientLoad()
    .onClient((ready) => {
      $.ajax({
        url: '/api/users',
        success(users) {
          defaultController(userListTemplate, { users });
          ready();
        },
        error() {
          defaultController(userListTemplate, { users: [], message: { error: 'Somethings\'s gone wrong' } });
          ready();
        },
      });
    })
    .onServer();
};

const wireUpAdd = () => {
  $('.selectpicker').selectpicker();
};

exports.add = () => {
  global.serverOrClientLoad()
    .onClient((ready) => {
      api.practices((err, practices) => {
        if (err) {
          defaultController(userAddTemplate, { message: { error: 'Somethings\'s gone wrong' } });
        } else {
          defaultController(userAddTemplate, { practices });
          wireUpAdd();
        }
        ready();
      });
    })
    .onServer((ready) => {
      wireUpAdd();
      ready();
    });
};

exports.delete = (ctx) => {
  global.serverOrClientLoad()
    .onClient((ready) => {
      defaultController(userDeleteTemplate, { email: ctx.params.email });
      ready();
    })
    .onServer();
};

const wireUpEdit = () => {
  $('.selectpicker').selectpicker();
};

exports.edit = (ctx) => {
  global.serverOrClientLoad()
    .onClient((ready) => {
      api.practices((err, practices) => {
        api.user(ctx.params.email, (userError, user) => {
          if (userError) {
            defaultController(userEditTemplate, { user: { roles: [] }, message: { error: 'Somethings\'s gone wrong' } });
          } else {
            defaultController(userEditTemplate, { user, practices });
            wireUpEdit();
          }
          ready();
        });
      });
    })
    .onServer((ready) => {
      wireUpEdit();
      ready();
    });
};
