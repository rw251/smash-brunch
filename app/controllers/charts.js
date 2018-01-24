const c3 = require('c3');

const singlePracticeComparison = (bindto, data) => {
  c3.generate({
    bindto,
    size: { height: 400 },
    data,
    axis: {
      x: {
        type: 'category',
        tick: {
          rotate: 60,
          multiline: false,
        },
      },
      y: {
        label: {
          text: '% of eligible patients affected',
          position: 'outer-middle',
        },
      },
    },
    point: { r: 6 },
    grid: { y: { show: true } },
  });
};

const singlePracticeTrend = (bindto, data, yLabel) => {
  c3.generate({
    bindto,
    size: { height: 400 },
    data,
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y-%m-%d',
          rotate: 60,
          multiline: false,
        },
        height: 60,
      },
      y: {
        label: {
          text: yLabel,
          position: 'outer-middle',
        },
      },
    },
    grid: {
      x: { show: true },
      y: { show: true },
    },
  });
};

const comparisonChartData = (tableData) => {
  const chartData = {
    keys: { x: 'x', value: ['ccg', 'practice'] },
    types: { ccg: 'line', practice: 'bar' },
    names: { ccg: 'CCG Average', practice: 'Aintry  Medical Practice' },
    colors: { ccg: 'black', practice: 'red' },
  };
  chartData.json = tableData
    .map(item => ({ x: item.short_name, ccg: item.ccg, practice: item.avg }));
  return chartData;
};

const averageTrendChartData = (trendData) => {
  const rtn = trendData;
  rtn.columns[0] = rtn.columns[0].map(v => v.substr(0, 10));
  return rtn;
};

const numberTrendChartData = (trendData) => {
  const rtn = trendData;
  rtn.columns[0] = rtn.columns[0].map(v => v.substr(0, 10));
  return rtn;
};

exports.displaySinglePracticeChart = (id, data) => {
  $('#chartPanel').show();
  switch (+id) {
    case 1:
      singlePracticeTrend('#singlePracticeChart', numberTrendChartData(data.trendChartData.num), 'Number of affected patients');
      break;
    case 2:
      singlePracticeTrend('#singlePracticeChart', averageTrendChartData(data.trendChartData.avg), '% of eligible patients affected');
      break;
    default:
      singlePracticeComparison('#singlePracticeChart', comparisonChartData(data.tableData));
  }
};
