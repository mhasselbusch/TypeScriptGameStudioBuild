/*============

  Module definitions

==============*/

//App modules
var express = require('express');
var fs = require('fs');
var app = module.exports = express();
var bodyParser = require('body-parser');

const { spawn } = require('child_process');

/*============

  Server Setup

==============*/

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'));

var compileQ = [];
var verifyURL = process.env.VERIFY_URL;
app.listen(process.env.PORT || 5001, function () {
	console.log("App now running on port", process.env.PORT || 5001);
});

/*============
  
  Server Endpoints

==============*/

app.post("/compile", function(req, res){

	console.log(req.body.email);
	res.write(200);
	res.end();
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
