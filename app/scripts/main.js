const $ = require('jquery');

window.$ = $;
window.jQuery = $;
require('bootstrap');
require('bootstrap-select');
require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-buttons/js/buttons.colVis.js')(window, $);
require('datatables.net-buttons/js/buttons.html5.js')(window, $);

const init = function init() {
  /*
  If you want to register a service worker */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker')
      .then(() => {
        // console.log('main.js -> Service Worker Registered');
      });
  }
};

module.exports = { init };
