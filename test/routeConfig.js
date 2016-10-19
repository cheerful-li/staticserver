

module.exports = {
	"GET /get/id/:id":function(req,res){
		console.log(req.url);
		console.log(req.params.id);
		res.send({'ok':200});
	},
	"Get /get/json": '/test/test.json',
	"get /get/plaintext": 'plain text',
	"get /get/obj":{message:'obj'},
	"post /xhr/vod/accountInfoView":function(req,res,next){
		res.send({"ret":{"balance":124.93,"vodStatus":1,"monthCharge":0.0},"code":200});
	},
	"/xhr/usr/getAccountInfoView":{"ret":{"liveMonthCharge":15.07,"liveStatus":1},"code":200},
	'get /haha':'hahec',
	'get /gog':'https://www.google.com.hk/?gws_rd=cr,ssl',
	'get /baidu':'https://www.baidu.com/',
	'get /sina':'http://www.sina.com.cn/',
	'post /xxx':'https://vcloud.163.com/xhr/live/channellist',
	'get /vc':'https://vcloud.163.com/'
};