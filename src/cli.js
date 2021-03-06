//命令行工具
//入口

var yargs = require('yargs');
var chalk = require('chalk');
var helper = require('./util/helper.js');
var entry = require('./index.js');

//控制台命令参数解析
var argv = yargs.usage('\nUsage:\n  staticserver [options ...]')
	.epilog(chalk.green('powered by lilieming!'))
	.help('help', 'show help list')
	.alias('help', 'h')
	.option('p', {  
		alias: 'port',
		demand: false,
		default: 8181,
		number: true,
		describe: '指定监听端口'
	})
	.option('livereload', {  
		demand: false,
		default: true,
		boolean: true,
		describe: '是否自动刷新'
	})
	.option('openbrowser', {  
		demand: false,
		default: true,
		boolean: true,
		describe: '是否自动打开浏览器'
	})
	.option('routefile', {  
		alias:'r',
		demand: false,
		string: true,
		describe: '路由配置文件'
	})
	.option('proxy', {  
		demand: false,
		string: true,
		describe: '代理模式，所有请求都走代理，除了--routefile里面的路由'
	})
	.argv;

//TODO: more config will be added
entry(argv);
