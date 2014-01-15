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
	if(req.session.token){
		console.log("HAVE TOKEN");
		req.logged_in = true;
    	helpers.get_tree(req, function(tree){ 
			helpers.get_user(req, function(user_info){
				req.session.user_info = user_info;
				res.render('index', {
    				tree: tree,
    				logged_in: req.logged_in,
    				user_info: user_info, 
    				FILEPICKER_KEY: process.env.FILEPICKER_KEY
    			}); 
			});
    	});
	}
	else{
		console.log("DONT HAVE TOKEN");
		var code = req.url.split("=")[1]
		var pathName = "https://github.com/login/oauth/access_token";
	  	var client_id = process.env.CLIENT_ID;
	  	var redirect_uri = "http://localhost:3000/home";
	  	var client_secret = process.env.CLIENT_SECRET;
	  	var fullPath = pathName+"?client_id="+client_id+"&redirect_uri="+redirect_uri+"&client_secret="+client_secret+"&code="+code;
	  	request(fullPath, function (error, response, token) {
			if (!error && response.statusCode == 200) {
				req.logged_in = true;
		    	req.session.token = "access_token="+process.env.USER_TOKEN+"&scope=repo&token_type=bearer";//token;
		    	//console.log(token);
		    	helpers.get_tree(req, function(tree){ 
	    			helpers.get_user(req, function(user_info){
	    				req.session.user_info = user_info;
	    				console.log(user_info);
	    				res.render('index', {
		    				tree: tree,
		    				logged_in: req.logged_in,
		    				user_info: user_info, 
		    				FILEPICKER_KEY: process.env.FILEPICKER_KEY
		    			}); 
	    			});
		    	});
		  	}
		})
  	}
}

exports.logout = function(req, res){
	req.session.destroy();
	res.redirect('/');
}

