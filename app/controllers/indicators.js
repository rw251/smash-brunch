const indicatorsTemplate = require('../../shared/templates/indicators.jade');
const defaultController = require('./default');
const global = require('../scripts/global');

// params, state, url
exports.index = () => {
  global.serverOrClientLoad()
    .onServer()
    .onClient((ready) => {
      defaultController(indicatorsTemplate);
      ready();
    });
};
