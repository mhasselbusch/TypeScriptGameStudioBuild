var express = require('express');
var fs = require('fs');
const { spawn } = require('child_process');
var app = express();
app.use(express.bodyParser());
var str = "";
var compileQ = [];


app.listen(process.env.PORT || 5000, function () {
	console.log("App now running on port", process.env.PORT || 5000);
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('Hello World!' + str);
});

app.post("/compile", function(req, res){

	console.log(req.content);

});

/*
	Quick sample spawning of child process to run the ls command.

	In the future, we will spawn child processes to run tsc on typescript files
*/
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
