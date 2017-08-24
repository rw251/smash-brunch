const notFoundTemplate = require('../../shared/templates/404.jade');
const defaultController = require('./default');

// params, state, url
module.exports = () => {
  defaultController(notFoundTemplate);
};
