const $ = require('jquery');

window.$ = $;
window.jQuery = $;
require('bootstrap');

const init = function init() {
  /*
  If you want to register a service worker */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
           .register('/service-worker')
           .then(() => { console.log('main.js -> Service Worker Registered'); });
  }
};

module.exports = { init };
