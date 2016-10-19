var httpProxy = require('http-proxy').createProxyServer({
	secure: false,
	changeOrigin: true /*,hostRewrite:true*/
});
var libUrl = require('url');
var helper = require('../util/helper.js');
var fs = require('fs');

var proxy = module.exports = function(options, server) {
	if (options.proxy.indexOf('http') !== 0) {
		return helper.log(`--proxy parameter values is ${options.proxy}, not a right target。 target should like \`http://xxx.xx/\``);
	}
	//重写hosts
	//先做windows端，TODO：other
	writeHosts(options,server);
	return function(req, res, next) {
		helper.getDomainIp(options.proxy,function(ip){
			console.log(req.method,":",req.url);
			req.url = libUrl.parse(req.url).path;
			var target = libUrl.parse(options.proxy);
			target.hostname = ip;
			// console.log(JSON.stringify(target));
			var pro = httpProxy.web(req, res, {
				target: target
			});
			/*httpProxy.on('proxyReq',function(proxyReq){
				// proxyReq._headers.host = "223.252.199.22"; //vcloud.163.com
				// proxyReq.setHeader("host")
				// console.log(JSON.stringify(proxyReq._headers),JSON.stringify(proxyReq.headers));
			});*/
		})
		
	}
}

var hostsPath = "C:/Windows/System32/drivers/etc/hosts";
var oldStr;
var newStr;
var domainIp;
if (fs.existsSync(hostsPath)) {
	oldStr = fs.readFileSync(hostsPath, 'utf8');
	process.on('SIGINT', function() {
		fs.writeFileSync(hostsPath, oldStr, 'utf8');
		console.log('process on SIGINT')
		process.exit(0);
	});
} else {
	console.log("can't find hosts file");
}


function writeHosts(options, server) {
	if(oldStr){
		var hostname = libUrl.parse(options.proxy).hostname;
		var reg = new RegExp("\\r\\n127.0.0.1 "+hostname+"$");
		if(reg.test(newStr)){
			newStr = oldStr;
		}else{
			newStr = oldStr + `\r\n127.0.0.1 ${hostname}`;
		}
		
		fs.writeFileSync(hostsPath, newStr, 'utf8');
		options.domain = hostname;
	}

}
function setHosts(){
	fs.writeFileSync(hostsPath, newStr, 'utf8');
}
function cancelHosts(){
	fs.writeFileSync(hostsPath, oldStr, 'utf8');
}

process.on('uncaughtException', function (err) {
  helper.log('An uncaught error occurred!', 'error');
  helper.log(err.stack, 'error');
});