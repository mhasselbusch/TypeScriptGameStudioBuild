(function(){

	function printDirectoryContents(spawn, directoryName){

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

	module.exports.execute = function(fs, spawn) {

		var compilations = "../compilations";

		/*
			We first need to create a desirable directory name.

			It will just be a number (one greater than the greatest already in the 
			./compilations directory)
		*/
		fs.readdir(compilations, 'rw', (err, files) => {

			var directoryName;

			if(files.length == 0){
				directoryName = "0"
			}
			else{
				directoryName = (parseInt(files[files.length - 1])++).toString();
			}

			/*
				Create the directory with the selected name
			*/
			const mkdir = spawn('mkdir', [directoryName]);

			mkdir.stdout.on('data', (data) => {
			  console.log(`stdout: ${data}`);
			  str = `stdout: ${data}`;
			});

			mkdir.stderr.on('data', (data) => {
			  console.log(`stderr: ${data}`);
			});

			mkdir.on('close', (code) => {

				printDirectoryContents(compilations);

				//Delete the folder
				const rm = spawn("rm", ['-rf', directoryName]);

				rm.stdout.on('data', (data) => {
				  	console.log(`stdout: ${data}`);
				  	str = `stdout: ${data}`;
				});

				rm.stderr.on('data', (data) => {
				  	console.log(`stderr: ${data}`);
				});

				rm.on('close', (code) => {	

					printDirectoryContents(compilations);
			  		console.log(`child process exited with code ${code}`);
				});

				console.log(`child process exited with code ${code}`);
			});

			
		});

	}
}());