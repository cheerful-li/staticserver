var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var pathToRegexp = require('path-to-regexp');
var _ = require('lodash');
var bodyParser = require('body-parser');
var libUrl = require('url');
var helper = require('../util/helper.js');
var  libEval = require('eval');
var routeConfig = module.exports = function(routefile) {
	var routefile = path.join(process.cwd(), routefile);
	if (!fs.existsSync(routefile)) return;
	var config = require(routefile);
	if (!config) return;
	var routes = parseConfig(config);
	//监听路由配置文件变动
	chokidar.watch(routefile).on('change', function(path) {
		//使用eval模块加载执行路由配置文件
		//   不能用require,因为require会直接用缓存
		routes = parseConfig(libEval(fs.readFileSync(routefile,'utf8')));
	}).on('unlink', function() {
		routes = [];
	});
	return function(req, res, next) {
		var pathname = libUrl.parse(req.url).pathname;
		var method = req.method.toLowerCase();
		var result = routes.some(function(route,index){
			if(route.method == 'all' || method == route.method.toLowerCase()){
				if(route.urlReg.test(pathname)){
					try{
						route.handler(req,res,next,route);
					}catch(err){
						helper.log(err.message,'error');
						res.send({error:err.message});
					}finally{

						return true;
					}
				}
			}
		});
		if(!result) next();
	}
}

// key:    'method url'
// 		method可以省略，默认all   url可以是符合express路由url规则的字符串，  例如 /path/:to   (req.params.to) ,   /path/*
// value:   String    http开头的地址，使用proxy
// 			String    文件路径，res.sendFile
// 			String	  直接返回字符串
// 			Object	  返回json数据
// 			Function   function(req,res,next)   req.body,req.params,req.query
function parseConfig(config) {
	var routes = [];
	for (var key in config) {
		var value = config[key];
		var splits = key.split(/\s+/);
		var url = splits.pop();
		var method = splits.pop() || 'all';
		var urlReg = pathToRegexp(url);
		var keys = urlReg.keys;

		var handler;
		if (_.isString(value)) {
			if (value.indexOf('http') == 0) {
				//TODO:PROXY
			} else {
				var abPath = path.join(process.cwd(), value);
				if (fs.existsSync(abPath)) {
					if (path.extname(value) == '.json') {
						handler = function(abPath,req, res) {
							res.send(require(abPath));
						}.bind(null,abPath)
					} else {
						handler = function(abPath,req, res) {
							res.sendFile(abPath);
						}.bind(null,abPath)
					}
				} else {

					handler = function(value,req, res) {
						res.send(value);
					}.bind(null,value)
				}
			}
		} else if (_.isPlainObject(value) || _.isArray(value)) {
			handler = function(value,req, res) {
				res.send(value);
			}.bind(null,value)
		} else if (_.isFunction(value)) {
			handler = function(req, res, next, route){
				//application/json
				bodyParser.json()(req, res, next);
				//application/x-www-form/urlencoded
				bodyParser.urlencoded({extended:true})(req, res, next);

				//url里面的参数放入req.params
				var matched = route.urlReg.exec(libUrl.parse(req.url).pathname);
				var params = {};
				route.keys.forEach(function(obj,index){
					params[obj.name] = matched[index+1];
				});
				req.params = params;
				route.originValue(req,res,next);
			}
		}
		routes.push({
			urlReg:urlReg,
			handler:handler,
			method:method,
			keys:keys,
			originValue:value
		})
	}
	return routes;
}