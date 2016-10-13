var chalk = require('chalk');



var helper = module.exports = {
	log: function(message, type) {
		var typeColorMap = {
			info: 'white',
			error: 'red',
			warn: 'yellow',
			success: 'green'
		};
		type = type||"info";
		var color = typeColorMap[type]
		if(color){
			console.log(chalk[color](message));
		}else{ 
			return console.log(message);
		}
	}
};