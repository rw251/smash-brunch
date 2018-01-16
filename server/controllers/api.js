const practiceController = require('./practice');
const indicatorController = require('./indicator');
const reportCtrl = require('./report');
const dateController = require('./date');
const common = require('./common');
const json2csv = require('json2csv');

const getAffectedUnique = (report, practice) => {
  const patients = {};
  const patientsMultiple = {};
  if (report && report.i && report.i.length > 0) {
    report.i.forEach((v) => {
      if (!common.isIndicatorUsed(v.id, practice)) return;
      if (v.p) {
        v.p.forEach((vv) => {
          if (!patients[vv]) patients[vv] = 1;
          else patientsMultiple[vv] = 1;
        });
      }
    });
  }
  return Object.keys(patients).length;
};

const getAffectedMultiple = (report, practice) => {
  const patients = {};
  const patientsMultiple = {};
  if (report && report.i && report.i.length > 0) {
    report.i.forEach((v) => {
      if (!common.isIndicatorUsed(v.id, practice)) return;
      if (v.p) {
        v.p.forEach((vv) => {
          if (!patients[vv]) patients[vv] = 1;
          else patientsMultiple[vv] = 1;
        });
      }
    });
  }
  return Object.keys(patientsMultiple).length;
};

const getPracticeData = async (req, res, next) => {
  const practiceId = +req.params.practiceId;
  const dateId = +req.params.dateId;
  const comparisonDateId = +req.params.comparisonDateId;
  const rtn = { practiceId };

  try {
    rtn.report = await reportCtrl.getForPracticeOnDate(practiceId, dateId);
    rtn.comparisonReport = await reportCtrl.getForPracticeOnDate(practiceId, comparisonDateId);
    rtn.practice = await practiceController.getById(practiceId);

    const firstReportDate = rtn.practice.first_report_date || new Date(2000, 1, 1);

    // rtn.datesForChart = await dateController.getDatesForCharts(firstReportDate);
    rtn.dateLookup = await dateController.list();
    rtn.datesForChart = rtn.dateLookup.filter(v => new Date(v.date) >= firstReportDate);
    rtn.allReports = await reportCtrl.getForPractice(practiceId);
    rtn.ccgTotals = await reportCtrl.getCcgTotals(dateId);
    rtn.indicatorLookup = await indicatorController.list();
    rtn.practiceLookup = await practiceController.list();
  } catch (err) {
    return next(err);
  }
  return rtn;
};

const getAllIndicatorData = async (req, res, next) => {
  const dateId = +req.params.dateId;
  const rtn = { };

  try {
    rtn.reports = await reportCtrl.getAllIndicatorData(dateId);

    // const firstReportDate = rtn.practice.first_report_date || new Date(2000, 1, 1);

    // rtn.datesForChart = await dateController.getDatesForCharts(firstReportDate);
    rtn.dateLookup = await dateController.list();
    rtn.datesForChart = rtn.dateLookup; // .filter(v => new Date(v.date) >= firstReportDate);

    rtn.allReports = await reportCtrl.getForAllIndicators(rtn.datesForChart.map(x => x._id));
    rtn.ccgTotals = await reportCtrl.getCcgTotals(dateId);
    rtn.practiceLookup = await practiceController.list();
  } catch (err) {
    return next(err);
  }
  return rtn;
};

const getSummaryData = (report, practice) => {
  const summaryData = {};

  summaryData.practiceSize = report.practiceSize;
  summaryData.totalPatients = getAffectedUnique(report, practice);
  summaryData.multiple = getAffectedMultiple(report, practice);
  summaryData.allIndicatorAverage = `${report.eligible === 0 ? 0 : ((report.affected / report.eligible) * 100).toFixed(1)}%`;

  return summaryData;
};

const getMetaData = (practiceId, practiceLookup, dateId, comparisonDateId, dateLookup) => {
  const practice = common.getObjectByUnderscoreId(practiceId, practiceLookup);
  const reportDate = common.getDate(dateId, dateLookup);
  const comparisonDate = common.getDate(comparisonDateId, dateLookup);

  let metadata = 'Patient Safety Dashboard';
  metadata += '\n\n';
  metadata += 'Perspective: Single Practice';
  metadata += '\n';
  metadata += `Practice: ${practice ? practice.long_name : ''}`;
  metadata += '\n';
  metadata += `Report date: ${reportDate ? reportDate.toDateString() : ''}`;
  metadata += '\n';
  metadata += `Comparison date: ${comparisonDate ? comparisonDate.toDateString() : ''}`;
  metadata += '\n\n';

  return metadata;
};

const getTableData = (
  report,
  comparisonReport,
  practice,
  indicatorLookup,
  ccgAverages,
  sortBy,
  sortReverse
) => {
  let ind = {};
  let reportIndicator = {};
  let indicator = {};
  let comparisonIndicators = [];
  let reportPatients = [];
  let comparisonPatients = [];
  let ccgAverage = {};
  let ccgAvg = 0;
  let avg = 0;
  let resolvedPatientCount = 0;
  let existingPatientCount = 0;
  let newPatientCount = 0;
  let i;
  let indicators = [];

  for (i = 0; i < indicatorLookup.length; i += 1) {
    indicator = {};
    avg = 0;
    ccgAverage = {};
    ccgAvg = 0;
    resolvedPatientCount = 0;
    existingPatientCount = 0;
    newPatientCount = 0;

    ind = indicatorLookup[i];

    if (common.isIndicatorUsed(ind._id, practice)) {
      indicator.id = ind._id;
      indicator.short_name = ind.short_name;
      indicator.long_name = ind.long_name;
      indicator.severity = ind.severity;

      // returns null if indicator not in report
      reportIndicator = common.getObjectById(ind._id, report.i);

      // Set default values to use if reportIndicator is null
      // Indicator is absent if eligible count is 0.
      if (!reportIndicator) {
        reportIndicator = { n: 0, d: 0, p: [] };
      }

      indicator.num = reportIndicator.n;
      indicator.denom = reportIndicator.d;
      if (indicator.denom > 0) {
        avg = (indicator.num / indicator.denom) * 100;
      }
      indicator.avg = +avg.toFixed(2);


      ccgAverage = common.getObjectByUnderscoreId(indicator.id, ccgAverages);

      if (ccgAverage && ccgAverage.d > 0) {
        ccgAvg = (ccgAverage.n / ccgAverage.d) * 100;
      }

      indicator.ccg = +ccgAvg.toFixed(2);

      reportPatients = reportIndicator.p;

      comparisonIndicators = common.getObjectById(indicator.id, comparisonReport.i);

      comparisonPatients = [];
      if (comparisonIndicators) {
        comparisonPatients = comparisonIndicators.p;
      }

      resolvedPatientCount = common.getResolvedCases(reportPatients, comparisonPatients).length;
      newPatientCount = common.getNewCases(reportPatients, comparisonPatients).length;
      existingPatientCount = common.getExistingCases(reportPatients, comparisonPatients).length;

      indicator.resolved = resolvedPatientCount;
      indicator.new = newPatientCount;
      indicator.existing = existingPatientCount;
      indicator.trendValue = newPatientCount - resolvedPatientCount;

      indicators.push(indicator);
    }
  }

  if (sortBy) {
    const multiplier = sortReverse ? -1 : 1;
    indicators = indicators.sort((a, b) => {
      if (typeof (a[sortBy]) === 'number') {
        return multiplier * (a[sortBy] - b[sortBy]);
      }
      if (a[sortBy] < b[sortBy]) {
        return -1 * multiplier;
      } else if (a[sortBy] > b[sortBy]) {
        return 1 * multiplier;
      }
      return 0;
    });
  }

  return indicators;
};

const getTrendChartData = (allReports, practice, indicatorLookup, dateLookup) => {
  // We assume we get a report for every date
  let i;
  let j;
  let report;
  let indicator;
  let date;
  const rtn = { num: { x: 'x', columns: [['x']] }, avg: { x: 'x', columns: [['x']] } };

  for (i = 0; i < indicatorLookup.length; i += 1) {
    indicator = indicatorLookup[i];
    if (common.isIndicatorUsed(indicator._id, practice)) {
      rtn.num.columns.push([indicator.short_name]);
      rtn.avg.columns.push([indicator.short_name]);
    }
  }

  for (i = 0; i < allReports.length; i += 1) {
    report = allReports[i];
    date = common.getDate(report.dateId, dateLookup);
    if (date === null) throw new Error('Date lookup failed');

    rtn.num.columns[0].push(date);
    rtn.avg.columns[0].push(date);
    let k = 0;
    for (j = 0; j < indicatorLookup.length; j += 1) {
      if (common.isIndicatorUsed(indicatorLookup[j]._id, practice)) {
        indicator = common.getObjectById(indicatorLookup[j]._id, report.i);

        const numToPush = indicator !== null ? indicator.n : 0;
        let avgToPush = 0;
        if (indicator && indicator.d > 0) avgToPush = (indicator.n / indicator.d) * 100;

        rtn.num.columns[k + 1].push(numToPush);
        rtn.avg.columns[k + 1].push(avgToPush);
        k += 1;
      }
    }
  }

  return rtn;
};

const getTableDataForAllIndicators = (reports, practiceLookup, sortBy, sortReverse) => {
  let pra;
  let report;
  let i;
  let practices = [];
  let practice = {};
  let avg;

  let totalAffected = 0;
  let totalEligible = 0;
  for (i = 0; i < reports.length; i += 1) {
    totalAffected += reports[i].affected;
    totalEligible += reports[i].eligible;
  }
  const ccgAvg = totalEligible > 0 ? (100 * totalAffected) / totalEligible : 0;

  // Assume that reports array includes a report for each practice.
  for (i = 0; i < reports.length; i += 1) {
    pra = {};
    avg = 0;

    report = reports[i];
    const { practiceId } = report;
    pra.id = practiceId;
    practice = common.getObjectByUnderscoreId(practiceId, practiceLookup);
    if (practice) { // Must be a practice that we don't show
      pra.short_name = practice.short_name;
      pra.long_name = practice.long_name;
      pra.num = report.affectedUnique;
      pra.patientsMultiple = report.multiple;
      if (report.eligible > 0) {
        avg = (report.affected / report.eligible) * 100;
      }
      pra.avg = +avg.toFixed(2);
      pra.ccg = +ccgAvg.toFixed(2);

      practices.push(pra);
    }
  }

  if (sortBy) {
    const multiplier = sortReverse ? -1 : 1;
    practices = practices.sort((a, b) => {
      if (typeof (a[sortBy]) === 'number') {
        return multiplier * (a[sortBy] - b[sortBy]);
      }
      if (a[sortBy] < b[sortBy]) {
        return -1 * multiplier;
      } else if (a[sortBy] > b[sortBy]) {
        return 1 * multiplier;
      }
      return 0;
    });
  }

  return practices;
};

const getTrendDataForAllIndicators = (allReports, practiceLookup, dateLookup) => {
  let i;
  let k;
  let practice;
  let dateReports;
  let dateReport;
  let ccgAffected;
  let ccgEligible;

  const rtn = { num: { x: 'x', columns: [['x']] }, avg: { x: 'x', columns: [['x'], ['CCG Avg']] }, patientsMultiple: { x: 'x', columns: [['x']] } };

  // Assume that reports array includes a report for each practice.
  for (i = 0; i < practiceLookup.length; i += 1) {
    practice = practiceLookup[i];

    rtn.num.columns.push([practice.short_name]);
    rtn.avg.columns.push([practice.short_name]);
    rtn.patientsMultiple.columns.push([practice.short_name]);
  }

  const fnOutside = result => result.dateId === dateLookup[i]._id;

  for (i = 0; i < dateLookup.length; i += 1) {
    const { date } = dateLookup[i];

    rtn.num.columns[0].push(date);
    rtn.avg.columns[0].push(date);
    rtn.patientsMultiple.columns[0].push(date);

    dateReports = allReports.filter(fnOutside);

    // calculate the CCG averages
    ccgAffected = 0;
    ccgEligible = 0;
    for (k = 0; k < dateReports.length; k += 1) {
      dateReport = dateReports[k];
      ccgAffected += dateReport.affected;
      ccgEligible += dateReport.eligible;
    }

    rtn.avg.columns[1].push(ccgEligible > 0 ? (100 * ccgAffected) / ccgEligible : 0);

    for (k = 0; k < practiceLookup.length; k += 1) {
      dateReport = common.getObjectByPracticeId(practiceLookup[k]._id, dateReports);
      if (dateReport === null) {
        dateReport = { affectedUnique: 0, eligible: 0, affected: 0, multiple: 0 };
      }

      rtn.num.columns[k + 1].push(dateReport.affectedUnique);
      rtn.avg.columns[k + 2].push(dateReport.eligible > 0
        ? (100 * dateReport.affected) / dateReport.eligible
        : 0);
      rtn.patientsMultiple.columns[k + 1].push(dateReport.multiple);
    }
  }

  return rtn;
};

exports.listIndicators = (req, res, next) => {
  indicatorController.list()
    .then(indicators => res.send(indicators))
    .catch(err => next(err));
};

exports.listPractices = (req, res, next) => {
  practiceController.list()
    .then(practices => res.send(practices))
    .catch(err => next(err));
};

exports.listDates = (req, res, next) => {
  dateController.list()
    .then(dates => res.send(dates))
    .catch(err => next(err));
};

exports.listDatesForDisplay = (req, res, next) => {
  dateController.listForDisplay()
    .then(dates => res.send(dates))
    .catch(err => next(err));
};

exports.getAllIndicatorData = async (req, res, next) => {
  const data = await getAllIndicatorData(req, res, next);
  const rtn = {};

  try {
    const { reports, practiceLookup, allReports, datesForChart } = data;
    rtn.tableData = getTableDataForAllIndicators(reports, practiceLookup);
    rtn.trendChartData = getTrendDataForAllIndicators(allReports, practiceLookup, datesForChart);
    res.json(rtn);
  } catch (e) {
    common.logError('[single-practice-api-controller] [exports.data] Error processing data: ', e);
    common.respondWithError(res, e);
  }
};

exports.getPracticeData = async (req, res, next) => {
  const data = await getPracticeData(req, res, next);
  const rtn = {};

  try {
    const { report, comparisonReport, practice, indicatorLookup } = data;
    const { ccgAverages, allReports, datesForChart } = data;
    rtn.tableData = getTableData(report, comparisonReport, practice, indicatorLookup, ccgAverages);
    rtn.summaryData = getSummaryData(report, practice);
    rtn.trendChartData = getTrendChartData(allReports, practice, indicatorLookup, datesForChart);
    res.json(rtn);
  } catch (e) {
    common.logError('[single-practice-api-controller] [exports.data] Error processing data: ', e);
    common.respondWithError(res, e);
  }
};

exports.exportPracticeData = async (req, res, next) => {
  const data = await getPracticeData(req, res, next);
  // RW - special characters are not correctly displayed in excel.

  // After investigation:
  /* - Notepad+=1 correctly opens the files - it is just excel that doesn't
    - The issue is to do with UTF8 vs UTF8 + BOM
    - Without BOM excel doesn't correctly interpret characters that are outside UTF8
    - Most other text viewers don't need the BOM and just know that if they see a character
      like 11000001 then it means (use the next 2 bytes), 11100001 (use the next 3 bytes) etc.
    - setting the charset differently doesn't seem to work
    - prepending '\xEF\xBB\xBF' doesn't work
    - this fiddle (http://jsfiddle.net/W432s/) for a client side download works but can't see how to
      translate it to server side
    - I will leave for now but possiblities are:
        o export as Excel using a different library
        o export as tab delimited?
        o translate the special characters prior to sending e.g. ? -> Women, ? -> >=
  */
  json2csv(
    {
      data: getTableData(
        data.report, data.comparisonReport, data.practice,
        data.indicatorLookup, data.ccgAverages, data.sortBy, data.sortReverse
      ),
      fields: ['short_name', 'num', 'denom', 'avg', 'ccg', 'resolved', 'existing', 'new', 'trendValue'],
      fieldNames: ['Indicator', 'Affected patients', 'Eligible patients', '% of eligible patients affected', 'CCG Avg (%)', 'Successful intervention', 'Action pending', 'New cases', 'Trend'],
    },
    (err, csv) => {
      const metadata = getMetaData(
        data.practiceId, data.practiceLookup,
        data.dateId, data.comparisonDateId, data.dateLookup
      );
      res.attachment('PatientSafety-Dashboard-SinglePractice-SingleIndicator.csv');
      res.end(metadata + csv, 'utf8');
    }
  );
};
