const multipleTemplate = require('../../shared/templates/multiple.jade');
const multipleContentTemplate = require('../../shared/templates/components/multipleContent.jade');
const api = require('./api');
const global = require('../scripts/global');
const defaultController = require('./default');
const $ = require('jquery');
const page = require('page');
const breadcrumbs = require('./breadcrumbs');

const displayBreadcrumbs = () => {
  const bc = [
    { label: 'Single Practice', path: '/practice' },
    { label: 'Practice X', path: `/practice/${global.selectedPracticeId}/${global.selectedDateId}` },
    { label: 'Multiple patients' },
  ];
  breadcrumbs.display(bc);
};

const displayDetails = (done) => {
  displayBreadcrumbs();

  api.patientMultipleData(global.selectedPracticeId, global.selectedDateId, (err, data) => {
    const multipleContentHtml = multipleContentTemplate(data);
    $('#content').html(multipleContentHtml);
    $('#patientTable').DataTable({
      searching: false, // we don't want a search box
      stateSave: true, // let's remember which page/sorting etc
      paging: false, // always want all indicators
      scrollY: '60vh',
      scrollCollapse: true,
    });

    if (done) done();
  });
};

const updateUrl = () => {
  const locationShouldBe = `/practice/${global.selectedPracticeId}/multiple/on/${global.selectedDateId}`;
  if (window.location.pathname !== locationShouldBe) { page.redirect(locationShouldBe); }
};

const navigate = () => {
  page.show(`/practice/${global.selectedPracticeId}/multiple/on/${global.selectedDateId}`, null, true);
};

const updateGlobalValue = prop => (changeEvent) => {
  global[prop] = +$(changeEvent.currentTarget).val();
  // updateUrl();
  navigate();
  // displayDetails();
};

const wireUpIndex = (done) => {
  $('.tooltip').tooltip('hide');
  $('#dateList').on('change', updateGlobalValue('selectedDateId'));
  displayDetails(done);
};

exports.index = (ctx) => {
  if (ctx.params.practiceId) { global.selectedPracticeId = +ctx.params.practiceId; }
  if (ctx.params.dateId) { global.selectedDateId = +ctx.params.dateId; }

  updateUrl();

  global.serverOrClientLoad()
    .onServer((ready) => {
      wireUpIndex(ready);
    })
    .onClient((ready) => {
      api.datesForDisplay((errDates, datesForDisplay) => {
        if (!global.selectedDateId) global.selectedDateId = datesForDisplay[0]._id;
        defaultController(multipleTemplate, {
          selectedDateId: global.selectedDateId,
          dates: datesForDisplay,
          breadcrumbs: [{ label: 'Single Practice' }],
        });
        wireUpIndex(ready);
      });
    });
};
