const $ = require('jquery');
const global = require('../scripts/global');

module.exports = (template, data) => {
  const templateData = data || {};
  if (global) {
    templateData.global = global;
    global.clientLoad();
  }
  const html = template(templateData);
  $('#mainContent').html(html);
};
