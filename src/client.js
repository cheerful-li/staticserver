//命令行工具
//入口

var yargs = require('yargs');
var chalk = require('chalk');
var helper = require('./util/helper.js');
var staticserver = require('./index.js');

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
		describe: 'server listen port'
	})
	.argv;

//TODO: more config will be added
staticserver(argv);
