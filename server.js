/*============

  Module definitions

==============*/

//App modules
var express = require('express');
var https = require("https");
var fs = require('fs');
var app = module.exports = express();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
const { spawn } = require('child_process');
var compilation = require('./lib/compilation')

/*============

  Server Setup

==============*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

var compileQ = [];
var verifyURL = process.env.VERIFY_URL;
var verifyLocalURL = process.env.VERIFY_LOCALURL;
var database_url = process.env.MONGODB_URI;

mongodb.MongoClient.connect(database_url, function(err, db) {

	if(err){
		console.log(err)
		process.exit(1);	
	}

	connection = db;

	//Export the database connection and the database module for use throughout the app
	module.exports.connection = connection;

	console.log("We are connected to the database");

	/*
	app.listen(process.env.PORT || 5001, function () {

		console.log("App now running on port", process.env.PORT || 5001);
	});
	*/

	app.listen(5001, function () {

		console.log("App now running on port", 5001);
	});
});


/*============
  
  Server Endpoints

==============*/

/*
	Main endpoint for the build server.

	Need to send along the email of the user and the content to compile.
*/
app.post("/compile", function(req, res){
		
	if(req.body.email != undefined && req.body.id != undefined){
		connection.collection('accounts').findOne({
			user_email : req.body.email,
			user_id : req.body.id
		}, function(err, object){

			//The user exists and we can proceed with the compilation
			if(!err){ 			
				compilation.execute(fs, req.body.contents, req.body.game_name, res);
			}
			else{
				res.write("invalid");
				res.status(500);
				res.end();
			}
		});
	}
	else{
		res.status(200);
		res.write("parameter error");
		res.end();
	}
});