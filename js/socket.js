gSocketHandler = new Object();
$(document).ready(function(){
	//gSocket = new WebSocket("ws://127.0.0.1:8888/canvasbattleserver/battleCom");
	gSocket = new WebSocket("ws://thelettercliff.com:8080/canvasbattleserver/canvasbattleserver/battleCom");

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