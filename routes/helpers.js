var request = require('request');
var fs = require( 'fs' );
var async = require( 'async' );

exports.newlab = function(req, callback){
	
}

exports.getLandingPage = function(req, callback){
	fs.readFile("welcome.md", 'utf8', function(err, data){
		if (err) { throw err; }
		callback(data);
	});
}

exports.get_folder_structure = function(req, callback){
	console.log(req.session.token);
	var mypath = '/repos/StartupInstitute/curriculum/contents?'+req.session.token;
	console.log(mypath);
	var options = {
	headers : {"User-Agent": "Curriculum Github"},
    url: 'https://api.github.com'+mypath,
    method: 'GET'};
	request(options, function (error, response, contents) {
		if (error) { console.log(error); }
		console.log(contents);
		if (!error && response.statusCode == 200) {
			contents = JSON.parse(contents);
			var folders = []
			for (var i=0;i<contents.length;i++){
				folders[i] = contents[i].name.toUpperCase();
			}
			callback(folders);
		}
	});
}

exports.get_product_structure = function(req, callback){
	var mypath = '/repos/StartupInstitute/curriculum/contents/'+'product'+'?'+req.session.token;
	var options = {
	headers : {"User-Agent": "Curriculum Github"},
    url: 'https://api.github.com'+mypath,
    method: 'GET'};
	request(options, function (error, response, contents) {
		if (error) { console.log(error); }
		if (!error && response.statusCode == 200) {
			contents = JSON.parse(contents);
			var files = []
			for (var i=0;i<contents.length;i++){
				var fullfile = contents[i].name.split(".")[0];
				var splitfile = fullfile.split("-");
				var month = splitfile[0];
				var day = splitfile[1];
				var year = splitfile[2];
				var name = splitfile[3].toUpperCase();
				files[i] = {"name": name, "month": month, "day": day, "year": year, "url": "/"+'product'+"/"+fullfile};
			}
			callback(files);
		}
	});
}

exports.get_file = function(req, callback){
	var mypath = '/repos/StartupInstitute/curriculum/contents/'+'product'+'/'+req.params.file+'.md?'+req.session.token;
	var options = {
		headers: { 
    		'User-Agent': 'Curriculum Github',
    		'Accept': 'application/vnd.github.v3.raw' 
    	},
    	url: 'https://api.github.com'+mypath,
    	method: 'GET'
    };
	request(options, function (error, response, contents) {
		console.log(contents);
		if (error) { console.log(error); }
		if (!error && response.statusCode == 200) {
			var options = {
				headers : {"User-Agent": "Curriculum Github"},
				url : 'https://api.github.com'+mypath
			}
			request(options, function (error, reply, metadata){
				console.log(metadata);
				var blob = JSON.parse(metadata).sha; 
				callback({"contents": contents, "blob": blob, "saveurl": "/"+'product'+"/"+req.params.file+"/save"});
			})
		}
	});
}

exports.save_file = function(req, callback){
	var relative_path = '/repos/StartupInstitute/curriculum/contents/'+'product'+'/'+req.params.file+'.md?'+req.session.token;
	var content = new Buffer(req.body.content_to_save).toString('base64');
	content = String(content);
	var full_path = 'https://api.github.com'+relative_path;
	var message = 'Update file';
	var sha = req.body.blob_to_save;

	var options = {
		"headers" : {"User-Agent": "Curriculum Github"},
		"method" : "PUT",
		"url" : full_path,
		"json" : {
			"message" : "my commit message",
			"content" : content,
			"sha" : sha
		}
	}
	console.log(options);
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
