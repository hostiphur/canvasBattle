$(document).ready(function(){
		ws = new WebSocket("ws://127.0.0.1:8888/canvasbattleserver/battleCom");

		ws.onopen = function(evt) { appendMessage("Connection open"); };

		ws.onmessage = function(evt) { appendMessage(evt.data); };

		ws.onclose = function(evt) { appendMessage("Connection closed."); };
	});

function appendMessage(msg){
	var el = document.getElementById('output');
	var curText = el.innerHTML;
	curText+=msg+'<br>';
	el.innerHTML = curText;
};
function sendMsg(){
	var el = document.getElementById('chatIn');
	ws.send(el.value);		
};
function closeSocket(){
	ws.disconnect();
};

var ws = null;