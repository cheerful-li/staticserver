var fs = require('fs');
var libPath = require('path');
var libUrl = require('url');
var ejs = require('ejs');

var render = ejs.compile(fs.readFileSync(libPath.join(__dirname,'folder/template.ejs'),'utf8'));

var folder = module.exports = function(req,res,next){
	var pathname = libUrl.parse(req.url).pathname;

	//处理nice_iconfont.css  nice_iconfont.eot .svg .ttf .woff
	if(pathname.indexOf('/nice_iconfont.') == 0){
		return res.sendFile(libPath.join(__dirname,'folder',pathname));
	}

	var path = libPath.join(process.cwd(),pathname);
	
	fs.stat(path, function(err, stats){
		//先确保能找到目录
		if(err!=null||!stats.isDirectory()){
			 return next()
		}
		var data = {};
		data.prePath = "";
		if(pathname != '/'){
			data.prePath = pathname.replace(/\/[^\/]*[\/]?$/,'');
			if(data.prePath == "") data.prePath = '/';
		}
		data.files = [];
		data.folders = [];
		data.curDir = data.title =  pathname;
		data.join = libPath.join;
		fs.readdir(path , function(err, subs){
			if(err!=null) return next();
			subs.forEach(function(file){
				var filepath = libPath.join(path,file);
				var filestat = fs.statSync(filepath);
				if(filestat.isFile()){
					data.files.push(file);
				}else if(filestat.isDirectory()){
					data.folders.push(file);
				} 
			});
			var html = render(data);
			res.setHeader('content-type','text/html');
			res.setHeader('content-length',Buffer.byteLength(html));
			return res.send(html);
		});
	});
}