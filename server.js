var express = require('express');
var fs = require('fs');
const { spawn } = require('child_process');
var app = express();
var str = "";
var compileQ = [];

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('Hello World!' + str);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

app.post("/compile", function(req, res){

	console.log(req);

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
