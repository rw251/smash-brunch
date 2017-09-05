const ccgTemplate = require('../../shared/templates/page2.jade');
const defaultController = require('./default');

// params, state, url
exports.index = () => {
  defaultController(ccgTemplate);
};
