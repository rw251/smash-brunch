const $ = require('jquery');
const main = require('./scripts/main');
const global = require('./scripts/global');
const routes = require('./scripts/routes');

const App = {
  init: function init() {
    $(document).ready(() => {
      if ($('#userLoggedIn').length > 0) global.isLoggedIn = true;
      else global.isLoggedIn = false;
      global.user = {};
      global.user.name = $('#userName').val();
      global.user.email = $('#userEmail').val();

      console.log(global);

      routes.start({ dispatch: false }); // dispatch - whether to perform initial dispatch
      main.init();
    });
  },
};

module.exports = App;