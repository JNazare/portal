var helpers = require('./helpers.js');

exports.show = function(req, res){
	req.session.track = "development";
	helpers.get_tree(req, function(tree){ 
	    res.render('index', {logged_in: true, tree: tree}); 
	});
}

exports.showlab = function(req, res){
	req.session.track = "development";
	helpers.get_tree(req, function(tree){ 
		helpers.get_file(req, function(result){ 
			res.render('index', {
				logged_in: true,
				root: './public', 
				contents: result.contents, 
				tree: tree,
				user_info: req.session.user_info,
				blob: result.blob, 
				saveurl: result.saveurl,
				FILEPICKER_KEY: process.env.FILEPICKER_KEY,
				current_filename: result.current_filename
			});
		});
	})
}

exports.savelab = function(req, res){
	req.session.track = "development";
	helpers.save_file(req, function(callback){
		res.send("HERE");
	});
}