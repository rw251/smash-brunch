const homeTemplate = require('../../shared/templates/home.jade');
const homeContentTemplate = require('../../shared/templates/components/homeContent.jade');
const api = require('./api');
const global = require('../scripts/global');
const defaultController = require('./default');
const $ = require('jquery');
const page = require('page');

const updateUrl = () => {
  page.show(`/practice/${global.selectedPracticeId ? `${global.selectedPracticeId}` : '0'}${global.selectedDateId ? `/${global.selectedDateId}` : ''}`, null, false);
  if (global.selectedPracticeId && global.selectedDateId) {
    api.practiceData(global.selectedPracticeId, global.selectedDateId, 2618, (err, data) => {
      console.log(data);
      const homeContentHtml = homeContentTemplate(data);
      $('#content').html(homeContentHtml);
    });
  }
};

const updateGlobalValue = prop => (changeEvent) => {
  global[prop] = $(changeEvent.currentTarget).val();
  updateUrl();
};

const wireUpIndex = () => {
  console.log('wiring up');
  $('.selectpicker').selectpicker();
  $('#practiceList').on('change', updateGlobalValue('selectedPracticeId'));
  $('#dateList').on('change', updateGlobalValue('selectedDateId'));
};

exports.index = (ctx) => {
  console.log('on load script called...');
  global.selectedPracticeId = ctx.params.id || 0;
  global.selectedDateId = ctx.params.dateId || false;

  global.serverOrClientLoad()
    .onServer((ready) => {
      wireUpIndex();
      ready();
    })
    .onClient((ready) => {
      api.practices((err, practices) => {
        api.datesForDisplay((errDates, datesForDisplay) => {
          defaultController(homeTemplate, {
            practices,
            selectedId: ctx.params.id,
            dates: datesForDisplay,
            selectedDateId: ctx.params.dateId,
          });
          wireUpIndex();
          ready();
        });
      });
    });
};
