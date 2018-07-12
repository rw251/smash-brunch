const indicatorTemplate = require('../../shared/templates/indicator.jade');
const indicatorContentTemplate = require('../../shared/templates/components/indicatorContent.jade');
const api = require('./api');
const global = require('../scripts/global');
const defaultController = require('./default');
const $ = require('jquery');
const page = require('page');
const breadcrumbs = require('./breadcrumbs');
const qs = require('qs');

let table;
let trendTable;
let $toggleButton;

const displayBreadcrumbs = () => {
  const bc = [
    { label: 'Single Practice', path: '/practice' },
    { label: 'Practice X', path: `/practice/${global.selectedPracticeId}/${global.selectedDateId}` },
    { label: $(`#indicatorList option[value=${global.selectedIndicatorId}]`).text() },
  ];
  breadcrumbs.display(bc);
};

const updateUrlParams = () => {
  const queryParams = {};

  // selected tab
  if (global.patientTabId) queryParams.tabId = global.patientTabId;

  // selected chart
  if (global.showChart) queryParams.chart = global.showChart;

  let queryString = qs.stringify(queryParams);
  if (queryString.length > 0) queryString = `?${queryString}`;

  page.show(`${window.location.pathname}${queryString}`, null, false);
  // sorted by
  // sort direction
};

const displayDetails = (done) => {
  displayBreadcrumbs();

  api.patientData(
    global.selectedPracticeId, global.selectedDateId, 2618,
    global.selectedIndicatorId, global.selectedReportType, (err, data) => {
      data.tabId = global.patientTabId;
      data.showChart = global.showChart;
      data.reportType = global.selectedReportType;
      const indicatorContentHtml = indicatorContentTemplate(data);
      $('#content').html(indicatorContentHtml);
      table = $('#patientTable').DataTable({
        info: false, // we don't want showing 1 to n of n
        searching: false, // we don't want a search box
        stateSave: true, // let's remember which page/sorting etc
        paging: false, // always want all indicators
        scrollY: '60vh',
        scrollCollapse: true,
      });
      trendTable = $('#trendTable').DataTable({
        info: false, // we don't want showing 1 to n of n
        searching: false, // we don't want a search box
        stateSave: true, // let's remember which page/sorting etc
        paging: false, // always want all indicators
        scrollY: '60vh',
        scrollCollapse: true,
      });
      $toggleButton = $('#toggleChart');
      $toggleButton
        .off('click')
        .on('click', () => {
          if (global.showChart === 'chart') global.showChart = 'table';
          else global.showChart = 'chart';
          updateUrlParams();
          displayDetails();
        });
      $('#tableTab').on('shown.bs.tab', () => {
        table.columns.adjust().draw(false); // ensure headers display correctly on hidden tab
      });
      $('#trendTableTab').on('shown.bs.tab', () => {
        trendTable.columns.adjust().draw(false); // ensure headers display correctly on hidden tab
        $toggleButton.show(); // only want toggle button on trend table tab
      });
      $('#trendTableTab').on('hidden.bs.tab', () => {
        $toggleButton.hide(); // only want toggle button on trend table tab
      });
      $('li a[role="tab"]').on('shown.bs.tab', (e) => {
        global.patientTabId = $(e.currentTarget).data('id');
        updateUrlParams();
      });
      if (done) done();
    }
  );
};

const updateUrl = () => {
  const locationShouldBe = `/practice/${global.selectedPracticeId}/${global.selectedDateId}/${global.selectedComparisonDateId}/${global.selectedIndicatorId}/${global.selectedReportType}`;
  if (window.location.pathname !== locationShouldBe) { page.redirect(locationShouldBe); }
};

const navigate = () => {
  page.show(`/practice/${global.selectedPracticeId}/${global.selectedDateId}/${global.selectedComparisonDateId}/${global.selectedIndicatorId}/${global.selectedReportType}`, null, true);
};

const updateGlobalValue = prop => (changeEvent) => {
  global[prop] = +$(changeEvent.currentTarget).val();
  navigate();
  // displayDetails();
};

const wireUpIndex = (done) => {
  $('.tooltip').tooltip('hide');
  $('.selectpicker').selectpicker();
  $('#indicatorList').on('change', updateGlobalValue('selectedIndicatorId'));
  $('#dateList').on('change', updateGlobalValue('selectedDateId'));
  displayDetails(done);
};

exports.index = (ctx) => {
  if (ctx.params.practiceId) { global.selectedPracticeId = +ctx.params.practiceId; }
  if (ctx.params.dateId) { global.selectedDateId = +ctx.params.dateId; }
  if (ctx.params.comparisonDateId) {
    global.selectedComparisonDateId = +ctx.params.comparisonDateId;
  }
  if (ctx.params.indicatorId) { global.selectedIndicatorId = +ctx.params.indicatorId; }
  if (ctx.params.reportType) { global.selectedReportType = ctx.params.reportType; }

  updateUrl();

  const query = qs.parse(ctx.querystring);
  if (query.tabId) {
    global.patientTabId = query.tabId;
  }
  if (query.chart) {
    global.showChart = query.chart;
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
          defaultController(indicatorTemplate, {
            practiceId: global.selectedPracticeId,
            dateId: global.selectedDateId,
            comparisonDateId: global.selectedComparisonDateId,
            indicatorId: global.selectedIndicatorId,
            indicators,
            dates: datesForDisplay,
            breadcrumbs: [{ label: 'Single Practice' }],
          });
          wireUpIndex(ready);
        });
      });
    });
};
