(function(){

	const { spawn } = require('child_process');
	var async = require('async');

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

	module.exports.execute = function(fs, data, res) {

		var compilationsDir = "./compilations";

		/*
			We first need to create a desirable directory name.

			It will just be a number (one greater than the greatest already in the 
			./compilations directory)
		*/

		fs.readdir(compilationsDir, (err, files) => {

			var directoryName;

			if(err){
				console.log(err);
			}
			else{

				/*
					Get rid of .DS_Store

					TODO: FILTER ALL FOLDERS NOT NUMBERS
				*/
				if(files[0] == '.DS_Store'){
					files.splice(0,1);
				}

				if(files.length == 0){
					directoryName = "0"
				}
				else{
					var x = Math.max.apply(null, files) + 1;
					directoryName = x.toString();
				}

				directoryName = compilationsDir + "/" + directoryName 

				/*
					Create the directory with the selected name and add the files to it
				*/
				fs.mkdir(directoryName, function(err){
					
					if(!err){

						console.log(data);

						async.eachSeries(
							
							data,

							function(obj, cb){

								fs.writeFile(directoryName + "/" + obj.gfile_name, 
								obj.gfile_contents, "utf8", (err) => {

									if(err) throw err;
									console.log(obj.gfile_name + " Saved");
									cb(err);
								});

							},

							function(err){
								
								if(err) throw err;

								console.log("All files saved");

								//Compile the game using the config file


								//Delete the directory after retrieving the compilation results

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

										fs.rmdir(directoryName, (err) => {
											console.log("Removed directory");
											res.status(200);
											res.end();
										});
									}
								);
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