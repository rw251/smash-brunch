const homeTemplate = require('../../shared/templates/home.jade');
const api = require('./api');
const global = require('../scripts/global');
const defaultController = require('./default');
const $ = require('jquery');
const page = require('page');

const wireUpIndex = () => {
  $('#practiceList').on('change', (e) => {
    page.show(`/practice/${$(e.currentTarget).val()}`, null, false);
  });
};
// params, state, url
exports.index = (ctx) => {
  if (global.server) {
    wireUpIndex();
  } else {
    api.practices((err, practices) => {
      if (err) console.log(err);
      defaultController(homeTemplate, { practices, selectedId: ctx.params.id });
      wireUpIndex();
    });
  }
};
