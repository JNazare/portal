var helpers = require('./helpers.js');
var CT = require('../modules/country-list');
var AM = require('../modules/account-manager');
var EM = require('../modules/email-dispatcher');

exports.index = function(req, res){
	console.log("HEREEEE");
	// check if the user's credentials are saved in a cookie //
	if (req.cookies.user == undefined || req.cookies.pass == undefined){
		req.logged_in = false;
		res.render('index', { title: 'Hello - Please Login To Your Account', logged_in: req.logged_in, FILEPICKER_KEY: process.env.FILEPICKER_KEY });
	}	else{
	// attempt automatic login //
		AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
			if (o != null){
			    req.session.user = o;
				res.redirect('/login');
			}	else{
				res.render('index', { title: 'Hello - Please Login To Your Account', logged_in: req.logged_in, FILEPICKER_KEY: process.env.FILEPICKER_KEY });
			}
		});
	}
	// req.logged_in = false;
	// res.render('index', {logged_in: req.logged_in, FILEPICKER_KEY: process.env.FILEPICKER_KEY});
};