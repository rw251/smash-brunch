const c3 = require('c3');

const singlePracticeComparison = (bindto, data) => {
  c3.generate({
    bindto,
    size: { height: 400 },
    data, // { json: [{ x: 'Amiod and no thyroid test', ccg: '11.54', practice: '48.28' }, { x: 'CKD and NSAID', ccg: '1.55', practice: '4.22' }, { x: 'HF and NSAID', ccg: '2.11', practice: '6.62' }, { x: 'Warf/NOAC and NSAID', ccg: '9.05', practice: '32.14' }, { x: 'LABA and no ICS', ccg: '1.07', practice: '3.26' }, { x: 'Warf/NOAC no GastProt and Antiplatelet', ccg: '10.69', practice: '23.33' }, { x: 'Aspirin and Antiplatelet ', ccg: '1.11', practice: '2.35' }, { x: 'GiB/PUD no GastProt and NSAID', ccg: '1.85', practice: '4.83' }, { x: 'Asthma and BB', ccg: '1.51', practice: '2.16' }, { x: 'GiB/PUD no GastProt and Antiplatelet', ccg: '2.49', practice: '2.45' }, { x: 'Mtx and no monitoring', ccg: '2.67', practice: '1.42' }, { x: 'CKD and triple whammy', ccg: '1.30', practice: '0.42' }, { x: 'Age≥65 no GastProt and NSAID', ccg: '0.32', practice: '0.00' }], keys: { x: 'x', value: ['ccg', 'practice'] }, types: { ccg: 'line', practice: 'bar' }, names: { ccg: 'CCG Average', practice: 'Aintry  Medical Practice' }, colors: { ccg: 'black', practice: 'red' } },
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
