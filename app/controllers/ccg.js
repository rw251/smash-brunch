const ccgTemplate = require('../../shared/templates/ccg.jade');
const defaultController = require('./default');
const global = require('../scripts/global');
const breadcrumbs = require('./breadcrumbs');

const displayBreadcrumbs = () => {
  const bc = [{ label: 'All Practices', path: '/ccg' }];
  if (global.selectedIndicatorId) {
    bc.push({ label: `prac${global.selectedIndicatorId}` });
  }
  breadcrumbs.display(bc);
};


// params, state, url
exports.index = () => {
  global.serverOrClientLoad()
    .onServer()
    .onClient((ready) => {
      defaultController(ccgTemplate);
      displayBreadcrumbs();
      ready();
    });
};
