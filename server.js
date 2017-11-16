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

	app.listen(process.env.PORT || 5000, function () {
		console.log("App now running on port", process.env.PORT || 5000);
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

	console.log(req.body.email);
	console.log(req.body.id);

	
	if(req.body.email != undefined && req.body.id != undefined){
		connection.collection('accounts').findOne({
			user_email : req.body.email,
			user_id : req.body.id
		}, function(err, object){

			//The user exists and we can proceed with the compilation
			if(!err){ 
				res.write(JSON.stringify(object));
				res.status(200);
				res.end();
			}
			else{
				res.status(500);
				res.end();
			}
		});
	}
	
});

/*============
	
	Quick sample spawning of child process to run the ls command.

	In the future, we will spawn child processes to run tsc on typescript files

============*/

const ls = spawn('ls', ['-lh', './']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  str = `stdout: ${data}`;
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
