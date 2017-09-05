const Practice = require('../models/Practice');

exports.list = (callback) => {
  // lean true returns json objects i.e. smaller but can't then save/update them
  Practice.find().lean().exec((err, practices) => {
    if (err) return callback(err);
    return callback(null, practices);
  });
};
