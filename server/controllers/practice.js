const Practice = require('../models/Practice');

// lean true returns json objects i.e. smaller but can't then save/update them
exports.list = () => Practice.find().lean().exec();
