gSocketHandler = new Object();
$(document).ready(function(){
	//gSocket = new WebSocket();
	gSocket = new WebSocket(settings.webSocketAddress);

	gSocket.onopen = function(evt) {
		sendMsg("{\"msgType\":\"register\"}");
	};

	gSocket.onmessage = gSocketHandler.onmessage;

	gSocket.onclose = function(evt) { };
});
$(window).unload(function() {
	closeSocket();
});

function sendMsg(msg){
	if (gSocket == null)
		return;
	gSocket.send(msg);		
};
function closeSocket(){
	if (gSocket == null)
		return;
	gSocket.close();
};

var gSocket = null;