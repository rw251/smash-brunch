const ccgTemplate = require('../../shared/templates/ccg.jade');
const defaultController = require('./default');

// params, state, url
exports.index = () => {
  defaultController(ccgTemplate);
};
