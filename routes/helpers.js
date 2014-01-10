var request = require('request');
var fs = require( 'fs' );
var async = require( 'async' );


// Get current Github user information
exports.get_user = function(req, callback){
	var options = {
		headers : {"User-Agent": "Curriculum Github"},
		url : 'https://api.github.com/user?'+req.session.token,
		method: 'GET'
	};
	request(options, function (error, response, user_info) {
		if (error) { console.log(error);}
		if (!error && response.statusCode == 200) {
			user_info = JSON.parse(user_info);
			callback({"pic": user_info.avatar_url, "name":user_info.name});
		}
	})
}

// Get contents of a file
exports.get_file = function(req, callback){

	var mypath = '/repos/StartupInstitute/curriculum/contents'+req.url+'.md?'+req.session.token;
	var options = {
		headers: { 
    		'User-Agent': 'Curriculum Github',
    		'Accept': 'application/vnd.github.v3.raw' 
    	},
    	url: 'https://api.github.com'+mypath,
    	method: 'GET'
    };
	request(options, function (error, response, contents) {
		console.log(req.session.track);
		if (error) { console.log(error); }
		if (!error && response.statusCode == 200) {
			var options = {
				headers : {"User-Agent": "Curriculum Github"},
				url : 'https://api.github.com'+mypath
			}
			request(options, function (error, reply, metadata){
				var blob = JSON.parse(metadata).sha; 
				callback({"contents": contents, "blob": blob, current_filename: req.params.file, "saveurl": req.url+"/save"});
			})
		}
	});
}

// Save contents of a file
exports.save_file = function(req, callback){
	var url_chunks = req.url.split("/");
	var to_save_url = "/"+url_chunks[1]+"/"+url_chunks[2];
	var relative_path = '/repos/StartupInstitute/curriculum/contents'+to_save_url+'.md?'+req.session.token;
	var content = new Buffer(req.body.content_to_save).toString('base64');
	content = String(content);
	var full_path = 'https://api.github.com'+relative_path;
	var message = 'Update file';
	var sha = req.body.blob_to_save;

	var options = {
		"headers" : {"User-Agent": "Revamped Curriculum Github"},
		"method" : "PUT",
		"url" : full_path,
		"json" : {
			"message" : "my commit message",
			"content" : content,
			"sha" : sha
		}
	}
    request(options, function (error, response, body) {
		if (error) { console.log(error); }
		if (response.statusCode != 200) {
			console.log(response.statusCode);
		}
		if (!error && response.statusCode == 200) {
			callback("SAVED");
		}
	});
}

// Parse a json of files
function parse_contents(raw_tree, track){
	var files = []
	for (var i=0;i<raw_tree.length;i++){
		var fullfile = raw_tree[i].path.split(".")[0];
		var splitfile = fullfile.split("-");
		var month = splitfile[0];
		var day = splitfile[1];
		var year = splitfile[2];
		var name = splitfile[3].toUpperCase();
		files[i] = {"name": name, "month": month, "day": day, "year": year, "url": "/"+track+"/"+fullfile};
	}
	return files
}


// Get the tree of all files in the curriculum repo
exports.get_tree = function(req, callback){
	var tree = {};
	var options = {
		headers : {"User-Agent": "Curriculum Github"},
		url : 'https://api.github.com/repos/StartupInstitute/curriculum/contents?'+req.session.token
	}
	request(options, function (error, reply, metadata){
		var dev_sha = JSON.parse(metadata)[0].sha;
		var mktg_sha = JSON.parse(metadata)[1].sha;
		var product_sha = JSON.parse(metadata)[2].sha;
		var sales_sha = JSON.parse(metadata)[3].sha;

		options["url"] = 'https://api.github.com/repos/StartupInstitute/curriculum/git/trees/'+product_sha+"?"+req.session.token;
		request(options, function (error, reply, data){
			var name = "product";
			var product_files = parse_contents(JSON.parse(data).tree, name);
			tree[0] = product_files;
			tree[0]["name"] = name.toUpperCase();

			options["url"] = 'https://api.github.com/repos/StartupInstitute/curriculum/git/trees/'+dev_sha+"?"+req.session.token;
			request(options, function (error, reply, data){
				var name = "development";
				var dev_files = parse_contents(JSON.parse(data).tree, name);
				tree[1] = dev_files;
				tree[1]["name"] = name.toUpperCase();
				
				options["url"] = 'https://api.github.com/repos/StartupInstitute/curriculum/git/trees/'+mktg_sha+"?"+req.session.token;
				request(options, function (error, reply, data){
					var name = "marketing"
					var mktg_files = parse_contents(JSON.parse(data).tree, name);
					tree[2] = mktg_files;
					tree[2]["name"] = name.toUpperCase();
					
					options["url"] = 'https://api.github.com/repos/StartupInstitute/curriculum/git/trees/'+sales_sha+"?"+req.session.token;
					request(options, function (error, reply, data){
						var name = "sales";
						var sales_files = parse_contents(JSON.parse(data).tree, "sales");
						tree[3] = sales_files;
						tree[3]["name"] = name.toUpperCase();
						callback(tree);
					})
				})
			})
		})
	})
}
