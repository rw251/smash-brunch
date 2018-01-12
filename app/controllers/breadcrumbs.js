const bcTemplate = require('../../shared/templates/components/breadcrumbs.jade');
const $ = require('jquery');

exports.display = (breadcrumbs) => {
  const html = bcTemplate({ breadcrumbs });
  $('#breadcrumbs').html(html);
};
