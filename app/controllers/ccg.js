const ccgTemplate = require('../../shared/templates/ccg.jade');
const defaultController = require('./default');

// params, state, url
exports.index = () => {

  if (global.server) {
    global.server = false;
    // wireUpIndex();
  } else {
    defaultController(ccgTemplate);
  }
};
