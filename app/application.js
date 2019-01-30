const $ = require('jquery');
const global = require('./scripts/global');
const page = require('page');
const routeCtrl = require('../shared/routes');
require('./scripts/routes');

window.$ = $;
window.jQuery = $;
require('bootstrap');
require('bootstrap-select');
require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-buttons/js/buttons.colVis.js')(window, $);
require('datatables.net-buttons/js/buttons.html5.js')(window, $);

const { router } = routeCtrl({ get: page });

const App = {
  init: function init() {
    $(document).ready(() => {
      // This only gets hit on initial page load from a server load
      global.serverLoad();

      router.get.start({ dispatch: true }); // dispatch - whether to perform initial dispatch

      // Register a service worker if browser supports it
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/service-worker')
          .then(() => {
            // console.log('main.js -> Service Worker Registered');
          });
      }
    });
  },
};

module.exports = App;
