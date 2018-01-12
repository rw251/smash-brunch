const Report = require('../models/Report');

// lean true returns json objects i.e. smaller but can't then save/update them
exports.getForPracticeOnDate = (practiceId, dateId) =>
  Report.findOne({ practiceId, dateId }).lean().exec();

exports.getForPractice = practiceId => Report.findOne({ practiceId }).lean().exec();

exports.getCcgTotals = (dateId) => {
  Report.aggregate([
    { $match: { dateId } },
    { $unwind: '$i' },
    { $group: { _id: '$i.id', n: { $sum: '$i.n' }, d: { $sum: '$i.d' } } },
  ]).exec();
};
