var request = require('request');
var fs = require( 'fs' );
var async = require( 'async' );
var helpers = require('./helpers.js');

exports.get_oauth_code = function(req, res){
	if(req.method =='GET') {
       var pathName = "https://github.com/login/oauth/authorize";
       var client_id = process.env.CLIENT_ID;
       var redirect_uri = "http://localhost:3000/home";
       var scope = "repo";
       res.redirect(pathName+"?client_id="+client_id+"&scope="+scope+"&redirect_uri="+redirect_uri);
	}
}

exports.get_oauth_token = function(req, res){
	var code = req.url.split("=")[1]
	var pathName = "https://github.com/login/oauth/access_token";
  	var client_id = process.env.CLIENT_ID;
  	var redirect_uri = "http://localhost:3000/home";
  	var client_secret = process.env.CLIENT_SECRET;
  	var fullPath = pathName+"?client_id="+client_id+"&redirect_uri="+redirect_uri+"&client_secret="+client_secret+"&code="+code;
  	request(fullPath, function (error, response, token) {
		if (!error && response.statusCode == 200) {
			req.logged_in = true;
	    	req.session.token = token;
	    	helpers.get_folder_structure(req, function(folders){ 
	    		helpers.get_product_structure(req, function(files){
	    			res.render('index', {
	    				folders: folders, 
	    				files: files, 
	    				logged_in: req.logged_in, 
	    				FILEPICKER_KEY: process.env.FILEPICKER_KEY
	    			}); 
	    		})
	    	});
	  	}
	})
}

exports.logout = function(req, res){
	req.session.destroy();
	res.render('index');
}