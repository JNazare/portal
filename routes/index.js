var helpers = require('./helpers.js');

exports.index = function(req, res){
	req.logged_in = false;
	res.render('login', {user: req.user, logged_in: req.logged_in, FILEPICKER_KEY: process.env.FILEPICKER_KEY});
};