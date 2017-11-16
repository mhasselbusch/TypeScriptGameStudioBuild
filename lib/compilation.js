(function(){

	const { spawn } = require('child_process');

	function printDirectoryContents(directoryName){

		const ls = spawn('ls', ['-lh', directoryName]);

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
	}

	module.exports.execute = function(fs) {

		var compilations = "./compilations";

		/*
			We first need to create a desirable directory name.

			It will just be a number (one greater than the greatest already in the 
			./compilations directory)
		*/

		fs.readdir(compilations, (err, files) => {

			var directoryName;

			if(err){
				console.log(err);
			}
			else{
				if(files.length == 1){
					directoryName = "0"
				}
				else{
					var x = parseInt(files[files.length - 1], 10) + 1;
					directoryName = x.toString();
				}

				console.log(directoryName);
				/*
					Create the directory with the selected name
				*/
				fs.mkdir(compilations + "/" + directoryName, function(err){
					if(!err){

						//TODO: Compilation login
					}
				});
				
			}
			
		});

	}
}());