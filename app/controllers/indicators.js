const indicatorsTemplate = require('../../shared/templates/indicators.jade');
const api = require('./api');
const defaultController = require('./default');
const global = require('../scripts/global');
const $ = require('jquery');
const page = require('page');
const breadcrumbs = require('./breadcrumbs');

const displayBreadcrumbs = () => {
  const bc = [{ label: 'Indicator Evidence Summaries', path: '/evidence' }];
  if (global.selectedIndicatorId) {
    bc.push({ label: $(`#indicatorList option[value=${global.selectedIndicatorId}]`).text() });
  }
  breadcrumbs.display(bc);
};

const updateUrl = () => {
  page.show(`/evidence/${global.selectedIndicatorId ? `${global.selectedIndicatorId}` : '0'}`, null, false);
  displayBreadcrumbs();
};

const updateGlobalValue = prop => (changeEvent) => {
  global[prop] = $(changeEvent.currentTarget).val();
  api.indicators((err, indicators) => {
    $('#info').html(indicators[global.selectedIndicatorId].info);
    updateUrl();
  });
};

const wireUpIndex = () => {
  console.log('wiring up');
  $('.selectpicker').selectpicker();
  $('#indicatorList').on('change', updateGlobalValue('selectedIndicatorId'));
};

// params, state, url
exports.index = (ctx) => {
  console.log('on load script called...');
  global.selectedIndicatorId = ctx.params.id || 0;
  global.serverOrClientLoad()
    .onServer((ready) => {
      wireUpIndex();
      displayBreadcrumbs();
      ready();
    })
    .onClient((ready) => {
      api.indicators((err, indicators) => {
        defaultController(indicatorsTemplate, {
          indicators,
          selectedId: ctx.params.id,
        });
        wireUpIndex();
        displayBreadcrumbs();
        ready();
      });
    });
};
