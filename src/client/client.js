var socket = io.connect(location.protocol+"//"+location.host);
socket.on("update",function(data){
	if(data.css){
		updateStyle();
	}else{
		location.reload();
	}
});
function updateStyle(){
	var styleTags = document.getElementsByTagName('link');
	for(var i =0; i<styleTags.length; i++){
		var tag = styleTags[i];
		var href = tag.getAttribute("href");
		if(href){
			href = href.replace(/[\?&]r=[^&]*/,'');
			href += (href.indexOf('?')==-1?'?r=':'&r=') + Math.random();
			tag.setAttribute("href",href);
		}
	}
}