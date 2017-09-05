const helpTemplate = require('../../shared/templates/page4.jade');
const defaultController = require('./default');

// params, state, url
exports.index = () => {
  defaultController(helpTemplate);
};
