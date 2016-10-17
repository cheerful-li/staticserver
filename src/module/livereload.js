var _ = require('lodash');
var chokidar = require('chokidar');
var socketIo = require('socket.io');
var libPath =require('path');
var helper = require("../util/helper.js");

var livereload = module.exports = function(options){
	var cwd = process.cwd();
	var io = socketIo.listen(options.server);

	//监听文件变动
	var watcher = chokidar.watch(cwd,{
		ignored:[/node_modules/]
	}).on('all',function(action, path){
		console.log(`file ${action}: ${path}`);
		var data = {"path":path};
		//css文件变动时，浏览器可以不刷新页面，只重新请求css文件，实现css自动刷新
		var extname = libPath.extname(path);
		if(extname === '.css'){
			data.css = true;
		}
		//使用socket.io与浏览器通信，通知文件变动
		io.emit('update',data);
	});
	return  function(req,res,next){

		//处理浏览器上自动刷新的两个脚本请求
		if(req.url == '/client/socket.io.client.js' || req.url == '/client/client.js'){
			return res.sendFile(libPath.join(__dirname,'..',req.url));
		}
		//html响应注入脚本处理
		injector(req, res, options);
		next();
	}
}

function injector(req, res, options){
	var _data = new Buffer('','utf8');
	var _writeHeadData;
	var originWriteHead = res.writeHead;
	var originEnd = res.end;
	var originWrite = res.write;
	//重写res.write res.send res.writeHead
	
	//缓存所有的返回数据到_data
	res.write = function(chunk, encoding){
		if(!chunk) return;
		if(!Buffer.isBuffer(chunk)) chunk = new Buffer(chunk, encoding||'utf8');
		_data = Buffer.concat([_data,chunk]);
	}
	//writeHead只能调用一次，调用后就会发送headers
	//为保证正确的content-length,因此先暂时缓存
	res.writeHead = function(){
		_writeHeadData = Array.prototype.slice.apply(arguments);
		console.log(arguments);
	}
	res.end = function(chunk, encoding, callback){
		res.write(chunk, encoding);
		var headObj;
		if(_writeHeadData){ //有调用writeHead，删除可能设置的content-length
			headObj = _.isObject(_writeHeadData[1])?_writeHeadData[1]:_.isObject(_writeHeadData[2])?_writeHeadData[2]:{};
			for(var name in headObj){
				if(name.tolowercase() == 'content-length'){
					delete headObj[name];
				}else{
					//使用setHeader设置头部字段
					res.setHeader(name, headObj[name]);
				}
			}
		}
		//html文件注入自动刷新的脚本
		var contentType = res.getHeader("content-type");
		if(contentType && contentType.indexOf('html')!=-1){
			_data = injectHtml(_data);
		}
		//正确的content-length头部
		res.setHeader('content-length',Buffer.byteLength(_data, encoding));
		//如果之前有调用过res.writeHead方法，那么放到这里来调用，可以设置status,statusCode
		if(_writeHeadData) originWriteHead.apply(res, _writeHeadData);
		//在最终end前覆盖重写的方法
		res.writeHead = originWriteHead;
		res.write = originWrite;
		res.end = originEnd;
		//end
		originEnd.call(res,_data, encoding);
	}
	function injectHtml(chunk){
		var result = chunk.toString('utf8').replace(/\<body\>/, function(all){
			return all + `<script src="/client/socket.io.client.js"></script><script src="/client/client.js"></script>`
		});
		// console.log(result)
		return result;
	}
}