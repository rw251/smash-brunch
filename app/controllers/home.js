const homeTemplate = require('../../shared/templates/home.jade');
const api = require('./api');
const global = require('../scripts/global');
const defaultController = require('./default');
const $ = require('jquery');
const page = require('page');

const wireUpIndex = () => {
  console.log('wiring up');
  $('.selectpicker').selectpicker();
  $('#practiceList').on('change', (e) => {
    global.selectedPracticeId = $(e.currentTarget).val();
    page.show(`/practice/${$(e.currentTarget).val()}${global.selectedDateId ? `/${global.selectedDateId}` : ''}`, null, false);
  });
  $('#dateList').on('change', (e) => {
    global.selectedDateId = $(e.currentTarget).val();
    page.show(`/practice/${global.selectedPracticeId ? `${global.selectedPracticeId}` : '0'}/${$(e.currentTarget).val()}`, null, false);
  });
};
// params, state, url
exports.index = (ctx) => {
  console.log('on load script called...');
  if (ctx.params.id) global.selectedPracticeId = ctx.params.id;
  if (ctx.params.dateId) global.selectedDateId = ctx.params.dateId;

  if (global.server) {
    delete global.server;
    console.log('server load');
    wireUpIndex();
  } else {
    console.log('client load');
    api.practices((err, practices) => {
      api.datesForDisplay((errDates, datesForDisplay) => {
        defaultController(homeTemplate, {
          practices,
          selectedId: ctx.params.id,
          dates: datesForDisplay,
          selectedDateId: ctx.params.dateId,
        });
        wireUpIndex();
      });
    });
  }
};
