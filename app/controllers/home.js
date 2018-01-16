const homeTemplate = require('../../shared/templates/home.jade');
const homeContentTemplate = require('../../shared/templates/components/homeContent.jade');
const api = require('./api');
const global = require('../scripts/global');
const defaultController = require('./default');
const $ = require('jquery');
const page = require('page');
const breadcrumbs = require('./breadcrumbs');
const qs = require('qs');
const charts = require('./charts');

let table;
let $exportButton;

const displayBreadcrumbs = () => {
  const bc = [{ label: 'Single Practice', path: '/practice' }];
  if (global.selectedPracticeId > 0) {
    bc.push({ label: $(`#practiceList option[value=${global.selectedPracticeId}]`).text() });
  }
  breadcrumbs.display(bc);
};

const updateUrlParams = () => {
  const queryParams = {};

  // selected tab
  if (global.singlePracticeTabId) queryParams.tabId = global.singlePracticeTabId;

  // selected chart
  if (global.singlePracticeChartId) queryParams.chartId = global.singlePracticeChartId;

  let queryString = qs.stringify(queryParams);
  if (queryString.length > 0) queryString = `?${queryString}`;

  page.show(`${window.location.pathname}${queryString}`, null, false);
  // sorted by
  // sort direction
};

const displayDetails = (done) => {
  displayBreadcrumbs();

  if (global.selectedPracticeId > 0 && global.selectedDateId) {
    api.practiceData(global.selectedPracticeId, global.selectedDateId, 2618, (err, data) => {
      data.tabId = global.singlePracticeTabId;
      data.chartId = global.singlePracticeChartId;
      const homeContentHtml = homeContentTemplate(data);
      $('#content').html(homeContentHtml);
      table = $('#indicatorTable').DataTable({
        searching: false, // we don't want a search box
        stateSave: true, // let's remember which page/sorting etc
        paging: false, // always want all indicators
        scrollY: '50vh',
        scrollCollapse: true,
      });
      $exportButton = $('#export');
      $('#tableTab').on('shown.bs.tab', () => {
        table.columns.adjust().draw(false); // ensure headers display correctly on hidden tab
        $exportButton.show(); // only want export button on table tab
      });
      $('#tableTab').on('hidden.bs.tab', () => {
        $exportButton.hide(); // only want export button on table tab
      });
      $('li a[role="tab"]').on('shown.bs.tab', (e) => {
        global.singlePracticeTabId = $(e.currentTarget).data('id');
        updateUrlParams();
      });
      if (global.singlePracticeChartId) {
        charts.displaySinglePracticeChart(global.singlePracticeChartId, data);
      }
      $('#id_chart')
        .selectpicker()
        .on('change', (e) => {
          global.singlePracticeChartId = $(e.currentTarget).val();
          charts.displaySinglePracticeChart(global.singlePracticeChartId, data);
          updateUrlParams();
        });
      if (done) done();
    });
  } else if (done) done();
};

const updateUrl = () => {
  page.show(`/practice/${global.selectedPracticeId}/${global.selectedDateId}`, null, false);
};

const updateGlobalValue = prop => (changeEvent) => {
  global[prop] = +$(changeEvent.currentTarget).val();
  updateUrl();
  displayDetails();
};

const wireUpIndex = (done) => {
  $('.selectpicker').selectpicker();
  $('#practiceList').on('change', updateGlobalValue('selectedPracticeId'));
  $('#dateList').on('change', updateGlobalValue('selectedDateId'));
  displayDetails(done);
};

exports.index = (ctx) => {
  if (ctx.params.id) { global.selectedPracticeId = +ctx.params.id; }
  if (ctx.params.dateId) { global.selectedDateId = +ctx.params.dateId; }

  updateUrl();

  const query = qs.parse(ctx.querystring);
  if (query.tabId) {
    global.singlePracticeTabId = query.tabId;
  }
  if (query.chartId) {
    global.singlePracticeChartId = query.chartId;
  }

  updateUrlParams();

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
            selectedId: global.selectedPracticeId,
            dates: datesForDisplay,
            selectedDateId: global.selectedDateId,
            breadcrumbs: [{ label: 'Single Practice' }],
          });
          wireUpIndex(ready);
        });
      });
    });
};
