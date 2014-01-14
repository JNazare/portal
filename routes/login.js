var request = require('request');
var fs = require( 'fs' );
var async = require( 'async' );
var helpers = require('./helpers.js');
var models = require('./models.js');
var mongoose = require('mongoose');

var UserSchema = models.userSchema;


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
		console.log(req.user.city);
		req.logged_in = true;
    	helpers.get_tree(req, function(tree){ 
			helpers.get_user(req, function(user_info){
				req.session.user_info = user_info;
				res.render('home', {
					copy: req.session.copy,
					user: req.user,
    				tree: tree,
    				logged_in: req.logged_in,
    				user_info: user_info, 
    				FILEPICKER_KEY: process.env.FILEPICKER_KEY,
    				user: req.user 
    			}); 
			});
    	});
	}
	else{
		console.log("DONT HAVE TOKEN");
		req.session.copy = req.user.city;
		var code = req.url.split("=")[1];
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
	    				res.render('home', {
	    					copy: req.user.city,
	    					user: req.user,
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

exports.signup = function(req, res){
	res.render('signup', { user: req.user, logged_in: req.logged_in});	
}

exports.lostpassword = function(req, res){
	res.render('lostpassword');	
}

exports.signingup = function(req, res){
	// console.log(req.body);
	var userSchema = mongoose.model('User', userSchema);
	var user = new userSchema({
		name: {
			first_name: req.body.first_name.toLowerCase(), 
			last_name: req.body.last_name.toLowerCase()
		},
		username: req.body.username.toLowerCase(),
		password: req.body.password,
		access_token: req.body.access_token,
		role: req.body.role,
		city: req.body.city
	});
	if((user.access_token=="S1instructor"&&user.role=="instructor"&&user.city!="master")||(user.access_token=="S1student"&&user.role=="student"&&user.city!="master")){
		console.log(user);
		user.save(function (err){
	    if (err){ return console.log("error", err);}
	    else{
        	console.log(req.body.first_name + " " + req.body.last_name);
            res.render('login', { user: req.user, logged_in: req.logged_in, message: 'Account created!'});
	        }
	    });    
	}
	else if(user.access_token=="S1admin"&&user.role=="admin"){
		user.city="master";
		console.log(user);
		user.save(function (err){
	    if (err){ return console.log("error", err);}
	    else{
        	console.log(req.body.first_name + " " + req.body.last_name + " ["+user.city+"]" );
            res.render('login', { user: req.user, logged_in: req.logged_in, message: 'Account created!'});
	        }
	    });
	}	
	else{
		res.render('signup', { user: req.user, logged_in: req.logged_in, message: 'Incorrect access token!'})
	}
}
