var chalk = require('chalk');
var libUrl = require('url');
var dns = require('dns');

var helper = module.exports = {
	log: function(message, type) {
		var typeColorMap = {
			info: 'white',
			error: 'red',
			warn: 'yellow',
			success: 'green'
		};
		type = type || "info";
		var color = typeColorMap[type]
		if (color) {
			console.log(chalk[color](message));
		} else {
			return console.log(message);
		}
	},
	//连接到DNS服务器解析域名，查找域名对应的ip
	getDomainIp: (function() {
		var ipMap = {};
		return function(url, callback) {
			if(ipMap[url]) return callback(ipMap[url]);
			var domain = libUrl.parse(url).hostname;
			dns.resolve4(domain,function(err, ip){
				if(err) return helper.log(err.message,'error');
				ipMap[url] = ip[0];
				return callback(ip[0]);
			})

		}
	})()

};