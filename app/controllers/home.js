const homeTemplate = require('../../shared/templates/home.jade');
const defaultController = require('./default');

// params, state, url
exports.index = () => {
  defaultController(homeTemplate);
};
