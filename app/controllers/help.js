const helpTemplate = require('../../shared/templates/help.jade');
const defaultController = require('./default');

// params, state, url
exports.index = () => {
  defaultController(helpTemplate);
};
