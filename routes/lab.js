var helpers = require('./helpers.js');

exports.showlab = function(req, res){
	helpers.get_tree(req, function(tree){ 
		helpers.get_file(req, function(result){ 
			res.render('lab', {
				user: req.user,
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
	helpers.save_file(req, function(callback){
		res.send("SAVED!");
	});
}