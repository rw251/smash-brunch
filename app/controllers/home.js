const homeTemplate = require('../../shared/templates/home.jade');
const homeContentTemplate = require('../../shared/templates/components/homeContent.jade');
const api = require('./api');
const global = require('../scripts/global');
const defaultController = require('./default');
const $ = require('jquery');
const page = require('page');
const breadcrumbs = require('./breadcrumbs');

let table;

const displayBreadcrumbs = () => {
  const bc = [{ label: 'Single Practice', path: '/practice' }];
  if (global.selectedPracticeId) {
    bc.push({ label: `prac${global.selectedPracticeId}` });
  }
  breadcrumbs.display(bc);
};

const displayDetails = (done) => {
  displayBreadcrumbs();

  if (global.selectedPracticeId && global.selectedDateId) {
    api.practiceData(global.selectedPracticeId, global.selectedDateId, 2618, (err, data) => {
      console.log(data);
      const homeContentHtml = homeContentTemplate(data);
      $('#content').html(homeContentHtml);
      table = $('#indicatorTable').DataTable({
        searching: false, // we don't want a search box
        stateSave: true, // let's remember which page/sorting etc
        paging: false, // always want all indicators
        scrollY: '50vh',
        scrollCollapse: true,
      });
      $('#tableTab').on('shown.bs.tab', () => {
        table.columns.adjust().draw(false); // ensure headers display correctly on hidden tab
      });
      if (done) done();
    });
  } else if (done) done();
};

const updateUrl = () => {
  console.log(global.selectedPracticeId, global.selectedDateId);
  page.show(`/practice/${global.selectedPracticeId ? `${global.selectedPracticeId}` : '0'}${global.selectedDateId ? `/${global.selectedDateId}` : ''}`, null, false);
  displayDetails();
};

const updateGlobalValue = prop => (changeEvent) => {
  global[prop] = $(changeEvent.currentTarget).val();
  updateUrl();
};

const wireUpIndex = (done) => {
  $('.selectpicker').selectpicker();
  $('#practiceList').on('change', updateGlobalValue('selectedPracticeId'));
  $('#dateList').on('change', updateGlobalValue('selectedDateId'));
  displayDetails(done);
};

exports.index = (ctx) => {
  global.selectedPracticeId = ctx.params.id || 0;
  global.selectedDateId = ctx.params.dateId || false;

  global.serverOrClientLoad()
    .onServer((ready) => {
      if (!global.selectedDateId) global.selectedDateId = $('#dateList').children().first().val();
      wireUpIndex(ready);
    })
    .onClient((ready) => {
      api.practices((err, practices) => {
        api.datesForDisplay((errDates, datesForDisplay) => {
          if (!global.selectedDateId) global.selectedDateId = datesForDisplay[0]._id;
          defaultController(homeTemplate, {
            practices,
            selectedId: ctx.params.id,
            dates: datesForDisplay,
            selectedDateId: ctx.params.dateId,
            breadcrumbs: [{ label: 'Single Practice' }],
          });
          wireUpIndex(ready);
        });
      });
    });
};
