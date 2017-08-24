const indicatorsTemplate = require('../../shared/templates/indicators.jade');
const defaultController = require('./default');

// params, state, url
exports.index = () => {
  defaultController(indicatorsTemplate);
};
