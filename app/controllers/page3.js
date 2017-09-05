const indicatorsTemplate = require('../../shared/templates/page3.jade');
const defaultController = require('./default');

// params, state, url
exports.index = () => {
  defaultController(indicatorsTemplate);
};
