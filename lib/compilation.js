/*

	TODO: Replace all if(err) throw err with proper error handling
	
	TODO: Create compilations folder if it does not exist
*/

(function(){

	const { spawn } = require('child_process');
	var async = require('async');
	var shorthash = require('shorthash');

	/*
		For debugging, print directory contents to see how the server
		deals with file creation and deletion

		@param {string} directoryName - name of the directory to be printed
	*/
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

	/*
		Delete the compilation directory and its contents after retrieving the compilation results. 
		Return them to the user.
	
		@param {string} directoryName - name of the directory to be deleted
		@param {object} data - file data that is used to loop through the async calls
		@param {string} outfile - name of the outfile with compiled code
		@param {object} response - response to return to user with errors or compiled code
		@param {res} res - HTTP response object
		@param {fs} fs - fs object
	*/
	function returnCompilationResult(directoryName, data, outfile, response, res, fs){

		async.eachSeries(

			data,

			function(obj, cb){
				
				
				fs.unlink(directoryName + "/" + obj.gfile_name, (err) => {
					
					if(err) throw err;
					console.log("Removed" +  obj.gfile_name);
					cb(err);
				});	
				
			},

			function(err){

				if (err) throw err;

				//Remove the outfile and the directory itself
				fs.unlink(outfile, (err) => {
					
					if(err) throw err;
					console.log("Removed" +  outfile);
					
					fs.rmdir(directoryName, (err) => {
						console.log("Removed directory");
						res.write(JSON.stringify(response));
						res.status(200);
						res.end();
					});
				});
			}
		)
	}
	/*
		Execute the compilation process for the files
	
		@param {fs} fs - fs object
		@param {object} fileData - file data that is used to loop through the async calls		
		@param {string} game_name - name of the game being compiled, used for unique directory name
		@param {res} res - HTTP response object
		@param {string} email - user's email, used for unique directory name
	
	*/
	module.exports.execute = function(fs, fileData, game_name, res, email) {

		var compilationsDir = "./compilations";

		/*
			We first need to create a desirable directory name.
		*/
		fs.readdir(compilationsDir, (err, files) => {

			var directoryName;

			if(err){
				console.log(err);
			}
			else{

				/*
					Get rid of .DS_Store
				*/
				if(files[0] == '.DS_Store'){
					files.splice(0,1);
				}

				//Remove the config file and the library from the array
				files.splice(files.indexOf("comp-config.json"), 1);
				files.splice(files.indexOf("library"), 1);		

				let uniqueName = shorthash.unique(game_name + email);

				directoryName = compilationsDir + "/" + uniqueName

				/*
					Create the directory with the selected name and add the files to it
				*/
				fs.mkdir(directoryName, function(err){
					
					if(!err){

						async.eachSeries(
							
							fileData,

							function(obj, cb){

								fs.writeFile(directoryName + "/" + obj.gfile_name, 
								obj.gfile_contents, "utf8", (err) => {

									if(err) throw err;
									console.log(obj.gfile_name + " Saved");
									cb(err);
								});

							},

							//After all writes are complete
							function(err){
								
								if(err) throw err;

								console.log("All files saved");

								//Outfile needs to have the full path
								var outfile = directoryName + "/" + game_name.replace(' ', '') + ".js";

								const tsc = spawn('tsc', ['--project', directoryName + "/tsconfig.json", '--outFile', outfile]);
								var error;

								//Stdout receives the compilation errors if they occur
								tsc.stdout.on('data', (data) => {
									console.log(`stdout: ${data}`);
									error += "\n" + data;
								});

								tsc.on('close', (code) => {

									console.log(`child process exited with code ${code}`);
									console.log("compiled");
									
									//Game compiled error free
									if(code == 0 && !error){

										//Construct the response 
										fs.readFile(outfile, (err, data) => {
											if (err) throw err;

											var response = {
												error : null,
												contents : data.toString()
											}

											returnCompilationResult(directoryName, fileData, outfile, response, res, fs);

										});
									}
									//Error in stdout
									else if(code == 2){

										/*
											TODO: Parse the error and remove all the junk in the beginning (full file path - keep file name and line)
										*/
										var response = {
											error : 1,
											contents : error
										}

										returnCompilationResult(directoryName, fileData, outfile, response, res, fs);
									}

									
								});
							}
						);					
					}
					else{
						console.log("Error saving files");
						res.status(200);
						res.end();
					}
				});
			}
		});
	}
}());