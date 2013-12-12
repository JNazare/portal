var helpers = require('./helpers.js');

exports.show = function(req, res){
	req.track = "product";
	helpers.get_product_structure(req, function(files){ 
	    res.render('index', {logged_in: true, files: files}); 
	});
}

exports.showlab = function(req, res){
	req.track = "product";
	helpers.get_folder_structure(req, function(folders){ 
		helpers.get_product_structure(req, function(files){
			helpers.get_file(req, function(result){ 
				console.log("HEREEE");
				res.render('index', {
					logged_in: true,
					root: './public', 
					contents: result.contents, 
					folders: folders,
					files: files, 
					blob: result.blob, 
					saveurl: result.saveurl,
					FILEPICKER_KEY: process.env.FILEPICKER_KEY
				});
			});
		})
	})
}

exports.savelab = function(req, res){
	req.track = "product";
	helpers.save_file(req, function(callback){
		res.send("HERE");
	});
}