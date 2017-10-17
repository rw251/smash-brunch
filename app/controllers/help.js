const helpTemplate = require('../../shared/templates/help.jade');
const defaultController = require('./default');
const global = require('../scripts/global');

// params, state, url
exports.index = () => {
  global.serverOrClientLoad()
    .onServer()
    .onClient((ready) => {
      defaultController(helpTemplate);
      ready();
    });
};
