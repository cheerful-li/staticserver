var express = require('express');
var http = require('http');
var exec = require('child_process').exec;
var libPath = require('path');
var helper = require('./util/helper.js');
var livereload = require('./module/livereload.js');
var folder = require('./module/folder.js');
var proxy = require('./module/proxy.js');
var routeConfig = require('./module/routeConfig.js');
//labor is the nickname of staticserver
var labor = module.exports = function(options) {
	var app = express();
	var server = http.createServer(app);

	//路由配置文件处理
	if (options.routefile) {
		app.use(routeConfig(options.routefile));
	}
	if (options.proxy) {
		app.use(proxy(options,server))
	} else {


		//添加live reload功能
		if (options.livereload) {
			options.server = server;
			app.use(livereload(options));
			helper.log('livereload open');
		}
		//静态文件目录展示页面
		app.use(folder);
		//响应静态文件
		app.use(express.static(process.cwd()));
	}
	server.listen(options.port);
	server.on('error', function(e) {
		if (e.code == 'EADDRINUSE') { //端口被占用时，报错提示
			helper.log(`port ${options.port} is in use, please try another!  example:  \`staticserver -p 9999\``, 'error');
		} else {
			helper.log(e.message, 'error');
		}
		process.exit(1);
	});
	server.on('listening', function() {
		helper.log('staticserver start at ' + options.port, 'success');
		if (options.openbrowser) {
			var url = `http://${options.domain||'localhost'}:${options.port}`;
			if(options.port == 80) url.replace(":80","");
			helper.log('open default browser in: ' + url, 'success');
			exec(`start ${url}`, function(err, stdout, stderr) {
				if (err) console.log(err.message, 'error');
			});
		}

	});
}