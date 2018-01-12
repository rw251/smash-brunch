const helpTemplate = require('../../shared/templates/help.jade');
const defaultController = require('./default');
const global = require('../scripts/global');
const breadcrumbs = require('./breadcrumbs');

const displayBreadcrumbs = () => {
  const bc = [{ label: 'Contact / Help' }];
  // if (global.selectedPracticeId) {
  //   bc.push({ label: `prac${global.selectedPracticeId}` });
  // }
  breadcrumbs.display(bc);
};

// params, state, url
exports.index = () => {
  global.serverOrClientLoad()
    .onServer()
    .onClient((ready) => {
      defaultController(helpTemplate);
      displayBreadcrumbs();
      ready();
    });
};
