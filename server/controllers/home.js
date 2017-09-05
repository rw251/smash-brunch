const practiceController = require('./practice');
const utils = require('./utils');

exports.index = (req, res, next) => {
  practiceController.list((err, practices) => {
    if (err) return next(err);
    const data = utils.getUserObject(req.user);
    data.title = 'Single Practice';
    data.practices = practices;
    data.selectedId = req.params.id;
    return res.render('home', data);
  });
};
