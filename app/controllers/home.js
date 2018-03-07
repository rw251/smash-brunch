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

const updateUrlParams = (isRedirect) => {
  const queryParams = {};

  // selected tab
  if (global.singlePracticeTabId) queryParams.tabId = global.singlePracticeTabId;

  // selected chart
  if (global.singlePracticeChartId) queryParams.chartId = global.singlePracticeChartId;

  let queryString = qs.stringify(queryParams);
  if (queryString.length > 0) queryString = `?${queryString}`;

  if (window.location.search !== queryString) {
    if (isRedirect) {
      page.redirect(`${window.location.pathname}${queryString}`);
      return false;
    }
    page.show(`${window.location.pathname}${queryString}`, null, false);
  }

  return true;
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
      $('[data-toggle="tooltip"]').tooltip();
      $('td.prominentLink').off('click').on('click', (e) => {
        page(e.currentTarget.firstChild.pathname, null, false);
      });

      // wire up chart panel
      $('#chartPanel').on('change', 'select', () => {
        data.startDate = $('#startDate').val();
        data.endDate = $('#endDate').val();
        charts.displaySinglePracticeChart(global.singlePracticeChartId, data);
      });

      if (done) done();
    });
  } else if (done) done();
};

const updateUrl = (isRedirect) => {
  // page.show(`/practice/${global.selectedPracticeId}/${global.selectedDateId}`, null, false);
  const locationShouldBe = `/practice/${global.selectedPracticeId}/${global.selectedDateId}`;
  if (window.location.pathname !== locationShouldBe) {
    if (isRedirect) {
      page.redirect(locationShouldBe);
      return false;
    }
    page.show(locationShouldBe, null, false);
  }
  return true;
};

const navigate = () => {
  page.show(`/practice/${global.selectedPracticeId}/${global.selectedDateId}`, null, true);
};

const updateGlobalValue = prop => (changeEvent) => {
  global[prop] = +$(changeEvent.currentTarget).val();
  navigate();
  // displayDetails();
};

const wireUpIndex = (done) => {
  $('.tooltip').tooltip('hide');
  $('.selectpicker').selectpicker();
  $('#practiceList').on('change', updateGlobalValue('selectedPracticeId'));
  $('#dateList').on('change', updateGlobalValue('selectedDateId'));
  displayDetails(done);
};

exports.index = (ctx) => {
  if (ctx.params.id) { global.selectedPracticeId = +ctx.params.id; }
  if (ctx.params.dateId) { global.selectedDateId = +ctx.params.dateId; }

  // if false then redirect so abort this page
  if (!updateUrl(true)) return;

  const query = qs.parse(ctx.querystring);
  if (query.tabId) {
    global.singlePracticeTabId = query.tabId;
  }
  if (query.chartId) {
    global.singlePracticeChartId = query.chartId;
  }

  if (!updateUrlParams(true)) return;

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
          global.setIsGlobal(false);
          wireUpIndex(ready);
        });
      });
    });
};
