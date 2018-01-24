const ccgTemplate = require('../../shared/templates/ccg.jade');
const ccgContentTemplate = require('../../shared/templates/components/ccgContent.jade');
const ccgSingleContentTemplate = require('../../shared/templates/components/ccgSingleContent.jade');
const api = require('./api');
const defaultController = require('./default');
const global = require('../scripts/global');
const breadcrumbs = require('./breadcrumbs');
const qs = require('qs');
const $ = require('jquery');
const page = require('page');
const charts = require('./charts');

let table;
let $exportButton;

const displayBreadcrumbs = () => {
  const bc = [{ label: 'All Practices', path: '/ccg' }];
  if (global.selectedIndicatorId) {
    bc.push({ label: $(`#indicatorList option[value=${global.selectedIndicatorId}]`).text() });
  }
  breadcrumbs.display(bc);
};

const updateUrlParams = () => {
  const queryParams = {};

  // selected tab
  if (global.ccgTabId) queryParams.tabId = global.ccgTabId;

  // selected chart
  if (global.ccgChartId) queryParams.chartId = global.ccgChartId;

  let queryString = qs.stringify(queryParams);
  if (queryString.length > 0) queryString = `?${queryString}`;

  page.show(`${window.location.pathname}${queryString}`, null, false);
  // sorted by
  // sort direction
};

const displayDetails = (done) => {
  displayBreadcrumbs();

  if (global.selectedIndicatorId === 0) {
    api.ccgAllIndicatorData(global.selectedDateId, (err, data) => {
      data.tabId = global.ccgTabId;
      data.chartId = global.ccgChartId;
      const ccgContentHtml = ccgContentTemplate(data);
      $('#content').html(ccgContentHtml);
      table = $('#indicatorTable').DataTable({
        info: false, // we don't want showing 1 to n of n
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
        global.ccgTabId = $(e.currentTarget).data('id');
        updateUrlParams();
      });
      if (global.ccgChartId) {
        charts.displaySinglePracticeChart(global.ccgChartId, data);
      }
      $('#id_chart')
        .selectpicker()
        .on('change', (e) => {
          global.ccgChartId = $(e.currentTarget).val();
          charts.displaySinglePracticeChart(global.ccgChartId, data);
          updateUrlParams();
        });
      if (done) done();
    });
  } else {
    api.ccgSingleIndicatorData(
      global.selectedIndicatorId,
      global.selectedDateId, 2618, (err, data) => {
        data.tabId = global.ccgTabId;
        data.chartId = global.ccgChartId;
        const ccgContentHtml = ccgSingleContentTemplate(data);
        $('#content').html(ccgContentHtml);
        table = $('#indicatorTable').DataTable({
          info: false, // we don't want showing 1 to n of n
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
          global.ccgTabId = $(e.currentTarget).data('id');
          updateUrlParams();
        });
        if (global.ccgChartId) {
          charts.displaySinglePracticeChart(global.ccgChartId, data);
        }
        $('#id_chart')
          .selectpicker()
          .on('change', (e) => {
            global.ccgChartId = $(e.currentTarget).val();
            charts.displaySinglePracticeChart(global.ccgChartId, data);
            updateUrlParams();
          });
        if (done) done();
      }
    );
  }
};

const updateUrl = () => {
  page.show(`/ccg/${global.selectedIndicatorId}/${global.selectedDateId}`, null, false);
};

const updateGlobalValue = prop => (changeEvent) => {
  global[prop] = +$(changeEvent.currentTarget).val();
  updateUrl();
  displayDetails();
};

const wireUpIndex = (done) => {
  $('.selectpicker').selectpicker();
  $('#indicatorList').on('change', updateGlobalValue('selectedIndicatorId'));
  $('#dateList').on('change', updateGlobalValue('selectedDateId'));
  displayDetails(done);
};


// params, state, url
exports.index = (ctx) => {
  if (ctx.params.id) { global.selectedIndicatorId = +ctx.params.id; }
  if (ctx.params.dateId) { global.selectedDateId = +ctx.params.dateId; }

  updateUrl();

  const query = qs.parse(ctx.querystring);
  if (query.tabId) {
    global.ccgTabId = query.tabId;
  }
  if (query.chartId) {
    global.ccgChartId = query.chartId;
  }

  updateUrlParams();

  global.serverOrClientLoad()
    .onServer((ready) => {
      wireUpIndex(ready);
    })
    .onClient((ready) => {
      api.indicators((err, indicators) => {
        api.datesForDisplay((errDates, datesForDisplay) => {
          if (!global.selectedDateId) global.selectedDateId = datesForDisplay[0]._id;
          defaultController(ccgTemplate, {
            indicators,
            selectedId: global.selectedIndicatorId,
            dates: datesForDisplay,
            selectedDateId: global.selectedDateId,
            breadcrumbs: [{ label: 'All Practices' }],
          });
          wireUpIndex(ready);
        });
      });
    });
};
