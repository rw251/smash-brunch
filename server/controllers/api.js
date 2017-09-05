const practiceController = require('./practice');

exports.list = (req, res, next) => {
  // lean true returns json objects i.e. smaller but can't then save/update them
  practiceController.list((err, practices) => {
    if (err) return next(err);
    return res.send(practices);
  });
};
