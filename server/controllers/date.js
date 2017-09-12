const DateModel = require('../models/Date'); // Can't call it Date

const shortMonthLookup = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const longMonthLookup = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getAllDates = (callback) => {
  DateModel.find().lean().exec((err, dates) => {
    if (err) return callback(err);
    return callback(null, dates);
  });
};

const prepareDatesForDisplay = (dates) => {
  // We only want to keep today, yesterday, last week, last month (30 days),
  // and anything more than 30 days
  const preppedDates = [];
  for (let i = dates.length - 1; i >= 0; i -= 1) {
    let actualDate = new Date(dates[i].date);

    // Jiggery pokery in case timezone of user is different
    actualDate = new Date(actualDate.getTime() + (actualDate.getTimezoneOffset() * 60000));
    const actualDateString = actualDate.toISOString();

    const shortDateText = `${actualDate.getDate()} ${shortMonthLookup[actualDate.getMonth()]}`;
    const longDateText = `${actualDate.getDate()} ${longMonthLookup[actualDate.getMonth()]} ${actualDate.getFullYear()}`;
    const j = dates.length - 1 - i;
    if (j === 0) preppedDates.unshift({ _id: dates[i]._id, value: `${shortDateText} (Latest)`, date: actualDateString });
    else if (j === 1) preppedDates.unshift({ _id: dates[i]._id, value: `${shortDateText} (1 day ago)`, date: actualDateString });
    else if (j === 7) preppedDates.unshift({ _id: dates[i]._id, value: `${shortDateText} (7 days ago)`, date: actualDateString });
    else if (j === 30) preppedDates.unshift({ _id: dates[i]._id, value: `${shortDateText} (30 days ago)`, date: actualDateString });
    else if (j > 30 || (new Date(actualDateString)).getDate() === 1) {
      preppedDates.unshift({ _id: dates[i]._id, value: longDateText, date: actualDateString });
    }
  }
  // order descending
  preppedDates.sort((a, b) => b._id - a._id);
  return preppedDates;
};

exports.list = (callback) => {
  // lean true returns json objects i.e. smaller but can't then save/update them
  getAllDates(callback);
};

exports.listForDisplay = (callback) => {
  getAllDates((err, dates) => {
    if (err) return callback(err);
    return callback(null, prepareDatesForDisplay(dates));
  });
};
