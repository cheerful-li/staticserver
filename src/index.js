var express = require('express');
var http = require('http');
var exec = require('child_process').exec;
var helper = require('./util/helper.js');
var livereload = require('./module/livereload.js');
//labor is the nickname of staticserver
var labor = module.exports = function(options){
	var app = express();
	var server = http.createServer(app);

	//添加live reload功能
	if(options.livereload){
		options.server = server;
		app.use(livereload(options));
	}
	//静态文件目录展示页面
	
	//响应静态文件
	app.use(express.static(process.cwd()));

	server.listen(options.port);
	server.on('error',function(e){
		if(e.code == 'EADDRINUSE'){//端口被占用时，报错提示
			helper.log(`port ${options.port} is in use, please try another!  example:  \`staticserver -p 9999\``);
		}else{
			helper.log(e.message, 'error');
		}
		process.exit(1);
	});
	server.on('listening', function(){
		helper.log('staticserver start at '+options.port);
		if(options.openbrowser){
			var url = `http://localhost:${options.port}`;
			helper.log('open default browser in: '+url);
			exec(`start ${url}`,function(err,stdout,stderr){
				if(err) console.log(err.message);
			});
		}
		
	});
}