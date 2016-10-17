

module.exports = {
	"GET /get/id/:id":function(req,res){
		console.log(req.url);
		console.log(req.params.id);
		res.send({'ok':200});
	},
	"Get /get/json": '/test/test.json',
	"get /get/plaintext": 'plain text',
	"get /get/obj":{message:'obj'},
	"get /xhr/*":function(req,res){
		console.log(req.url);
		res.send('/xhr/*');
	},
	'get /haha':'hahec'
};