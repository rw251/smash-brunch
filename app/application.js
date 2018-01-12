const $ = require('jquery');
const main = require('./scripts/main');
const global = require('./scripts/global');
const page = require('page');
const routeCtrl = require('../shared/routes');
require('./scripts/routes');

const { router } = routeCtrl({ get: page });

const App = {
  init: function init() {
    $(document).ready(() => {
      if ($('#userLoggedIn').length > 0) global.isLoggedIn = true;
      else global.isLoggedIn = false;
      global.user = {};
      global.user.name = $('#userName').val();
      global.user.email = $('#userEmail').val();
      global.serverLoad();

      console.log(global);

      router.get.start({ dispatch: true }); // dispatch - whether to perform initial dispatch
      main.init();
    });
  },
};

module.exports = App;
