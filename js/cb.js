/*This is my (Cliff Newton) attempt at creating a completely browser based
tank capture the flag game. At present the code is pretty bad. This project
started out as just a bunch of tinkering to see what HTML Canvas can do, but
I started having so much fun that I eventually started turning it into an actual
game. Code refactoring is coming as soon as I decide on the complete feature set.*/

var Direction = {up:0x01, down:0x02, left:0x04, right:0x08};
var IE = document.all?true:false;
var gTop = 0;
var gBottom = 600;
var gLeft = 0;
var gRight = 800;
var gShotVelocity = 300;//that's 300 pixels per second
var gSite = new Vector2(0, 0);
var gCanvas = document.getElementById("canvas");
var memCanvas = document.createElement("canvas");
var gUI = 0;
var gLevel = null;
var gPlayers = new Array();
var gExplosions = new Array();
var gShotID = 0;
var gKeyboardState = new keyboardState();
var gLastFrame = new Date();

var bgImg = new Image();   // Create new Image object
var tankBaseRed = new Image();   // Create new Image object
var tankBaseBlue = new Image();   // Create new Image object
var tankBaseYellow = new Image();   // Create new Image object
var tankBaseGreen = new Image();   // Create new Image object
var tankBaseOrange = new Image();   // Create new Image object
var tankBasePurple = new Image();   // Create new Image object
var tankTurret = new Image();   // Create new Image object
var bullet = new Image();   // Create new Image object
var explosion = new Image();
var gDiagnostics = null;

tankTurret.src = './images/tankTurret.png';
tankBaseRed.src = './images/tankBaseRed.png';
tankBaseBlue.src = './images/tankBaseBlue.png';
tankBaseYellow.src = './images/tankBaseYellow.png';
tankBaseGreen.src = './images/tankBaseGreen.png';
tankBaseOrange.src = './images/tankBaseOrange.png';
tankBasePurple.src = './images/tankBasePurple.png';

bgImg.src = './images/background.jpg'; // Set source path  
bullet.src = './images/bullet.png'; // Set source path  
explosion.src = './images/explosion.png';

keyDown = function (e){
	var key;
	if (!e) e = event;
	key = e.which;
	gKeyboardState.keyPressed(key);
	if (gKeyboardState.keyListener)
		gKeyboardState.keyListener(gKeyboardState.getPressedKeyMask());
};
keyUp = function(e){
	var key;
	if (!e) e = event;
	key = e.which;
	gKeyboardState.keyReleased(key);
	if (gKeyboardState.keyListener)
		gKeyboardState.keyListener(gKeyboardState.getPressedKeyMask());
};

var gLocalPlayer = new Player(new Point(10, 300));
gKeyboardState.keyListener = transmitPlayerKeyState;
gLocalPlayer.ship.alive = false;
gPlayers.push(gLocalPlayer);

document.onmousemove = moveSite;
document.onkeydown = keyDown;
document.onkeyup = keyUp;
document.onmouseup = doMouseUp;

gSocketHandler.onmessage = function(evt) {
	var obj = JSON.parse(evt.data);
	if (obj.msgType == "register"){
		gLocalPlayer.regKey = obj.playerKey;
	} else if (obj.msgType == "msg"){
		$('#msgOutput').append(obj.msgData);
	} else if (obj.msgType == "deregister"){
		removePlayer(obj);
	} else if (obj.msgType == "spawn"){
		spawnPlayer(obj);
	} else if (obj.msgType == "shot"){
		makeEnemyShot(obj);
	} else if (obj.msgType == "destroyShip"){
		destroyEnemyPlayer(obj.playerKey);
	} else if (obj.msgType == "destroyShot"){
		destroyShot(obj);
	} else if (obj.msgType == "keyUpdate"){
		updatePlayerKeyState(obj);
	} else if (obj.msgType == "shipState"){
		updatePlayerShip(obj);
	}
};

function main(){
	gUI = Math.ceil(1000 / 100);
	gLevel = new level1();
	if (!gCanvas)
		gCanvas = $("#canvas");
	
	if (settings.diagnosticMode == true)
 		gDiagnostics = new diagnostics();
    		
	//Disable text select
	gCanvas.onselectstart = function() {return false;} // ie
	gCanvas.onmousedown = function() {return false;} // mozilla	
	setInterval("update()", gUI);
};

function update(){
	if (gDiagnostics)
		gDiagnostics.update();

	var curFrame = new Date();
	var secondRatio = (curFrame.getTime()-gLastFrame.getTime())/1000; 
	var i = 0;
	var j = 0;
	for (i = 0; i < gPlayers.length; i++){
		for (j = 0; j < gPlayers[i].shots.length; j++){
			var sh = gPlayers[i].shots[j];
			sh.iVector.scale(gShotVelocity*secondRatio);
			sh.shape.pos.x += sh.iVector.x;
			sh.shape.pos.y += sh.iVector.y;
			testShotCollision(sh);
			if (sh.bounceCount >= 2){
				makeExplosion(sh.shape.pos);
				gPlayers[i].shots.splice(j, 1);
				j--;
			}
		}
	}
	for (i = 0; i < gExplosions.length; i++){
		var ex = gExplosions[i];
		if (ex.finished == true){
			gExplosions.splice(i, 1);
			i--;
		}		
	}
	var dMask = gLocalPlayer.keyState;
	var pShip = gLocalPlayer.ship;
	pShip.turretAngle = Math.atan2(gSite.y - (pShip.shape.pos.y + (tankTurret.height/2)), gSite.x - (pShip.shape.pos.x + (tankTurret.width/2)));
	pShip.moveShip(dMask, secondRatio);
	testShipCollision(pShip);
	transmitShipState();
	draw();
	gLastFrame = curFrame;
};
function draw() {
	gCanvas = document.getElementById("canvas");
	memCanvas.width = gCanvas.width;
	memCanvas.height = gCanvas.height;
	var ctx = memCanvas.getContext("2d");//gCanvas.getContext("2d");
	ctx.canvas.width  = $("#canvas").width();
  	ctx.canvas.height = $("#canvas").height();
	var i = 0;
	var j = 0;

	ctx.clearRect (0, 0, memCanvas.width, memCanvas.height);
	tileBackground(ctx);
	ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
	for (i = 0; i < gPlayers.length; i++)
		gPlayers[i].ship.draw(ctx);
	ctx.fillStyle = "rgb(0, 0, 0)";
	
	//for (i = 0; i < gLevel.objects.length; i++)
//		ctx.drawImage(gLevel.objects[i].img, gLevel.objects[i].pos.x, gLevel.objects[i].pos.y);
	gLevel.drawShapes(ctx);
	for (i = 0; i < gPlayers.length; i++)
		for (j = 0; j < gPlayers[i].shots.length; j++)
			gPlayers[i].shots[j].draw(ctx);
	for (i = 0; i < gExplosions.length; i++)
		gExplosions[i].draw(ctx);
	var ctx2 = gCanvas.getContext("2d");
	ctx2.canvas.width  = $("#canvas").width();
  	ctx2.canvas.height = $("#canvas").height();
	ctx2.drawImage(memCanvas, 0, 0);
};
function tileBackground(ctx){
	//return;
	var col = 0;
	var row = 0;
	var width = $("#canvas").width();
	var height = $("#canvas").height();
	while (row < height){
		col = 0;
		while (col < width){
			ctx.drawImage(bgImg, col, row, 128, 128);
			col += 128;
		}
		row += 128;
	}
};
function testShotCollision(curShot){

	var shotMid = new Point(curShot.shape.pos.x + (curShot.img.width/2), curShot.shape.pos.y + (curShot.img.height/2));

	for (i = 0; i < gLevel.shapes.length; i++){
		var shape = gLevel.shapes[i];
		var result = testShapeCollision(curShot.shape, shape);
		if (result == null)
			continue;
		var normVector = result.normal;

		var bounceVector= new Vector2(	curShot.iVector.x-normVector.x*normVector.dotProd( curShot.iVector )*2,
										curShot.iVector.y-normVector.y*normVector.dotProd( curShot.iVector )*2);
		curShot.iVector = bounceVector;
		curShot.bounceCount++;
	}
	
	//test collisions with other bullets
	for (i = 0; i < gPlayers.length; i++){
		for (j = 0; j < gPlayers[i].shots.length; j++){
			var b = gPlayers[i].shots[j];
			if (b == curShot)
				continue;
			var mid = new Point(b.shape.pos.x + (b.img.width/2), b.shape.pos.y + (b.img.height/2));
			if (shotMid.length(mid) <= ((curShot.img.width/2) + (b.img.width/2))){
				b.destroy();
				curShot.destroy();
			}
		}
	}
	if (gLocalPlayer.ship.alive == true){
		var mid = new Point(gLocalPlayer.ship.shape.pos.x + (gLocalPlayer.ship.img.width/2), gLocalPlayer.ship.shape.pos.y + (gLocalPlayer.ship.img.height/2));
		if (shotMid.length(mid) <= ((curShot.img.width/2) + (gLocalPlayer.ship.img.width/2))){
			gLocalPlayer.ship.destroy();
			transmitShipDestruction();
			curShot.destroy();
		}
	}
};
function testShipCollision(ship){
	for (i = 0; i < gLevel.shapes.length; i++){
		var shape = gLevel.shapes[i];
		var result = testShapeCollision(ship.shape, shape);
		if (result == null)
			continue;
		var normVector = result.normal;
		normVector.scale(result.overlap);
		ship.shape.pos.x += -normVector.x;
		ship.shape.pos.y += -normVector.y;
	}	
};

/*
1. get vector by grabbing two adjacent points. vector is the difference between the points.
2. get normal of vector retrieved in step 1.
3. loop through each point in polygon 1 and project it onto the normal in step 2.
	a. if point is smaller than minimum point recorded, replace the min with current.
	b. if point is larger than maximum point recorded, replace the max with current.
4. Repeat step 3 for polygon 2.
5. test for overlap by checking if min or max is within range of the other min/max.
*/
function testShapeCollision(shape1, shape2){
	var min1 = 0;
	var max1 = 0;
	var min2 = 0;
	var max2 = 0;
	var leastInt = 1000;
	var leastNorm = null;
	var i = 0;
	for (i = 0; i < shape1.getVertexCount(); i++){
		shape1.collisionFace = null;
		var norm = shape1.getFaceNormal(i);
		var pt = shape1.getVertexPoint(0);
		var j = 0;
		var tmp = 0;
		min1 = max1 = pt.x * norm.x + pt.y * norm.y;
		for (j = 0; j < shape1.getVertexCount(); j++){
			tmp = shape1.getVertexPoint(j).x * norm.x + shape1.getVertexPoint(j).y * norm.y;
			if (tmp < min1)
				min1 = tmp;
			else if (tmp > max1)
				max1 = tmp;
		}
		min2 = max2 = shape2.getVertexPoint(0).x * norm.x + shape2.getVertexPoint(0).y * norm.y;
		for (j = 0; j < shape2.getVertexCount(); j++){
			tmp = shape2.getVertexPoint(j).x * norm.x + shape2.getVertexPoint(j).y * norm.y;
			if (tmp < min2)
				min2 = tmp;
			else if (tmp > max2)
				max2 = tmp;
		}
		if (max1 < min2 || min1 > max2)
			return null;
		var whole = Math.abs(max2 - min1);
		var len1 = Math.abs(max1 - min1);
		var len2 = Math.abs(max2 - min2);
		var overlap = (len1+len2)-whole;
		if (overlap <= 0)
			return null;
		if (overlap < leastInt){
			leastInt = overlap;
			leastNorm = norm;
		}
	}
	
	for (i = 0; i < shape2.getVertexCount(); i++){
		shape2.collisionFace = null;
		var norm = shape2.getFaceNormal(i);
		var pt = shape1.getVertexPoint(0);
		var j = 0;
		var tmp = 0;
		min1 = max1 = pt.x * norm.x + pt.y * norm.y;
		for (j = 0; j < shape1.getVertexCount(); j++){
			tmp = shape1.getVertexPoint(j).x * norm.x + shape1.getVertexPoint(j).y * norm.y;
			if (tmp < min1)
				min1 = tmp;
			else if (tmp > max1)
				max1 = tmp;
		}
		min2 = max2 = shape2.getVertexPoint(0).x * norm.x + shape2.getVertexPoint(0).y * norm.y;
		for (j = 0; j < shape2.getVertexCount(); j++){
			tmp = shape2.getVertexPoint(j).x * norm.x + shape2.getVertexPoint(j).y * norm.y;
			if (tmp < min2)
				min2 = tmp;
			else if (tmp > max2)
				max2 = tmp;
		}
		if (max1 < min2 || min1 > max2)
			return null;
		var whole = Math.abs(max2 - min1);
		var len1 = Math.abs(max1 - min1);
		var len2 = Math.abs(max2 - min2);
		var overlap = (len1+len2)-whole;
		if (overlap <= 0)
			return null;
		if (overlap < leastInt){
			leastInt = overlap;
			leastNorm = norm;
		}
	}
	return {overlap: leastInt, normal: leastNorm};
};
function makeExplosion (pos){
	var ex = new sprite(explosion, 64, new spriteCell(0, 0), new spriteCell(3, 3));
	ex.pos.x = pos.x - 32;
	ex.pos.y = pos.y - 32;
	gExplosions.push(ex);
};
function moveSite(e) {
	if (IE) {
		gSite.x = event.clientX + document.body.scrollLeft;
		gSite.y = event.clientY + document.body.scrollTop;
	}
	else {
		gSite.x = e.pageX;
		gSite.y = e.pageY;
	}
	if (gCanvas != null){
		gSite.x -= gCanvas.offsetLeft;
		gSite.y -= gCanvas.offsetTop;
	}
	return true;
};
function shoot(e){
	if (gLocalPlayer.shots.length >= 5)
		return;
	if (gLocalPlayer.ship.alive == false)
		return;
	gShotID++;
	var src = new Vector2(gLocalPlayer.ship.shape.pos.x + (tankTurret.width/2), gLocalPlayer.ship.shape.pos.y + (tankTurret.height/2));
	var tgt = gSite;
	var sh = new Shot(bullet, gShotID, gLocalPlayer.regKey);
	sh.destroyXmtFunc = transmitShotDestruction;
	sh.iVector = new Vector2(tgt.x - src.x, tgt.y - src.y);
	var placement = new Vector2(sh.iVector.x, sh.iVector.y);
	placement.scale(sh.img.width*2);
	sh.iVector.scale(gShotVelocity);
	
	sh.shape.pos.x = gLocalPlayer.ship.shape.pos.x + placement.x;
	sh.shape.pos.y = gLocalPlayer.ship.shape.pos.y + placement.y;
	
	transmitShot(sh);
	gLocalPlayer.shots.push(sh);
	var fire = new Audio("./audio/tank-fire.ogg");
	fire.play();
};
function transmitShot(shot){
	var xmtShot = 	"{\"msgType\":\"shot\"," +
					"\"shotID\":" + shot.id + "," +
					"\"playerKey\":\"" + gLocalPlayer.regKey + "\"," +
					"\"incVector\":{\"x\": "+shot.iVector.x+", \"y\":"+shot.iVector.y+"}," +
					"\"position\":{\"x\": "+shot.shape.pos.x+", \"y\":"+shot.shape.pos.y+"}}";
	sendMsg(xmtShot);
};
function transmitShipDestruction(){
	var xmt = 	"{\"msgType\":\"destroyShip\", " +
				"\"playerKey\":\"" + gLocalPlayer.regKey + "\"}";
	sendMsg(xmt);
};
function transmitShotDestruction(shot){
	var xmt = 	"{\"msgType\":\"destroyShot\", " +
				"\"shotID\": " + shot.id + "," +
				"\"ownerKey\":\"" + shot.ownerKey + "\"}";	
	sendMsg(xmt);
};
function transmitPlayerKeyState(keyState){
	gLocalPlayer.keyState = keyState;
	var xmt = 	"{\"msgType\":\"keyUpdate\", " +
				"\"keyState\":" + keyState + "," +
				"\"playerKey\":\"" + gLocalPlayer.regKey + "\"}";
	//sendMsg(xmt);	
};
function transmitShipState(){
	var ship = gLocalPlayer.ship;
	if (ship.alive == false)
		return;
	var xmt = 	"{\"msgType\":\"shipState\"," +
				"\"playerKey\":\"" + gLocalPlayer.regKey + "\"," +
				"\"position\":{\"x\":"+ship.shape.pos.x+", \"y\":"+ship.shape.pos.y+"}," +
				"\"angle\":" + ship.angle + "," +
				"\"turretAngle\":" + ship.turretAngle + "}";
	sendMsg(xmt);
};

function makeEnemyShot(jsonShot){
	for (var i = 0; i < gPlayers.length; i++){
		if (gPlayers[i].regKey == jsonShot.playerKey){
			var shot = new Shot(bullet,
								jsonShot.shotID,
								jsonShot.playerKey,
								new Vector2(jsonShot.incVector.x, jsonShot.incVector.y),
								new Point(jsonShot.position.x, jsonShot.position.y));
			shot.destroyXmtFunc = transmitShotDestruction;
			gPlayers[i].shots.push(shot);
			var fire = new Audio("./audio/tank-fire.ogg");
			fire.play();
			return;			
		}
	}
};
function spawnPlayer(jsonPlayer){
	for (var i = 0; i < gPlayers.length; i++){
		if (gPlayers[i].regKey == jsonPlayer.playerKey){
			gPlayers[i].ship.shape.pos.x = jsonPlayer.position.x;
			gPlayers[i].ship.shape.pos.y = jsonPlayer.position.y;
			gPlayers[i].ship.alive = true;
			return;
		}
	}
	var p = new Player(new Point(jsonPlayer.x, jsonPlayer.y), jsonPlayer.playerKey);
	gPlayers.push(p);	
};
function removePlayer(jsonPlayer){
	for (var i = 0; i < gPlayers.length; i++){
		if (gPlayers[i].regKey == jsonPlayer.playerKey){
			gPlayers.splice(i, 1);
			return;	
		}
	}
};
function destroyEnemyPlayer(playerKey){
	for (var i = 0; i < gPlayers.length; i++){
		if (gPlayers[i].regKey == playerKey){
			gPlayers[i].ship.destroy();
			makeExplosion(gPlayers[i].ship.shape.pos);
			return;
		}
	}
};
function updatePlayerKeyState(jsonKeyState){
	for (var i = 0; i < gPlayers.length; i++){
		if (gPlayers[i].regKey == jsonKeyState.playerKey){
			gPlayers[i].keyState = jsonKeyState.keyState;
			return;
		}
	}
};
function updatePlayerShip(jsonShip){
	for (var i = 0; i < gPlayers.length; i++){
		if (gPlayers[i].regKey == jsonShip.playerKey){
			var ship = gPlayers[i].ship;
			ship.shape.pos.x = jsonShip.position.x;
			ship.shape.pos.y = jsonShip.position.y;
			ship.angle = jsonShip.angle;
			ship.turretAngle = jsonShip.turretAngle;
			return;
		}
	}
	spawnPlayer(jsonShip);
};
function destroyShot(jsonShot){
	for (var i = 0; i < gPlayers.length; i++){
		if (gPlayers[i].regKey != jsonShot.ownerKey)
			continue;
		for (var j = 0; j < gPlayers[i].shots.length; j++){
			var shot = gPlayers[i].shots[j];
			if (shot.id == jsonShot.shotID){
				shot.destroy(false);
				makeExplosion(shot.shape.pos);
				gPlayers[i].shots.splice(j, 1);
				return;
			}
		}
	}
};
function doMouseUp(e){
	if (gLocalPlayer.ship.alive == false){
		$("#instructionArea").fadeOut();
		gLocalPlayer.ship.shape.pos.x = gSite.x;
		gLocalPlayer.ship.shape.pos.y = gSite.y;
		gLocalPlayer.ship.alive = true;
		sendMsg("{\"msgType\":\"spawn\", \"playerKey\":\""+gLocalPlayer.regKey+"\", \"position\":{\"x\":"+gSite.x+", \"y\":"+gSite.y+"}}");
	}
	else
		shoot(e);
};
/*Vector2 class *********************************************************************************/
function Vector2(x, y){
	this.x = x;
	this.y = y;
	this.length = function(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};
	this.normalize = function(){
		var len = Math.sqrt((this.x*this.x) + (this.y*this.y));
		this.x /= len;
		this.y /= len;
	};
	this.scale = function(scalar){
		this.normalize();
		this.x *= scalar;
		this.y *= scalar;
	};
	this.dotProd = function(b){
		return (this.x*b.x) + (this.y*b.y);
	};
	this.copy = function(srcVector){
		this.x = srcVector.x;
		this.y = srcVector.y;
	};
	this.project = function(vector){
		var dp = (this.x * vector.x) + (this.y * vector.y); 
		return new Vector2(	( dp / (vector.x * vector.x + vector.y * vector.y) ) * vector.x,
							( dp / (vector.x * vector.x + vector.y * vector.y) ) * vector.y);
	};
	this.findP3 = function(b, distance){
		p3 = new Vector2(b.x - this.x, b.y - this.y);
		p3.x *= distance;
		p3.y *= distance;				
		p3.normalize();
		p3.x += this.x;
		p3.y += this.y;
		return p3;
	};
	
};
/*Point class *********************************************************************************/
function Point(x, y){
	this.x = x;
	this.y = y;
	this.length = function(b){
		if (b == null)
			return 0;
		return (Math.sqrt(Math.pow(this.x - b.x, 2) + Math.pow(this.y - b.y, 2)));
	};
};
/*Boundary class *********************************************************************************/
function Boundary(start, end){
	this.start = start;
	this.end = end;
};
/*Player class *********************************************************************************/
function Player(spawnPoint, regKey){
	this.keyState = 0;
	this.ship = new Ship(tankBaseRed, spawnPoint);
	this.shots = new Array();
	this.regKey = "";
	if (regKey)
		this.regKey = regKey;
};
/*Ship class *********************************************************************************/
function Ship(img, spawnPoint){
	this.img = img;
	this.width = 20;
	this.height = 20;
	this.angle = 0;
	this.turretAngle = 0;
	this.movementInc=75;//that's 75 pixels per second
	this.alive = true;
	this.shape = new Shape([{x: spawnPoint.x, y: spawnPoint.y},
							{x: 0, y: 0},
							{x: this.width, y: 0},
							{x: this.width, y: this.height},
							{x: 0, y: this.height}]);
								
	this.moveShip = function(directionMask, secondRatio){
		var angle = 0;
		var count = 0;
		var moveAmt = (this.movementInc * secondRatio);
		if (directionMask & Direction.up){
			this.shape.pos.y -= moveAmt;
			angle += 90 * (Math.PI / 180);
			count++;
		}
		if (directionMask & Direction.left){
			this.shape.pos.x -= moveAmt;
			angle += 180 * (Math.PI / 180);
			count++;
		}
		if (directionMask & Direction.right){
			this.shape.pos.x += moveAmt;
			angle += 0;
			count++;
		}
		if (directionMask & Direction.down){
			this.shape.pos.y += moveAmt;
			angle += 270 * (Math.PI / 180);
			count++;
		}
		if (count > 0)
			this.angle = -(angle / count);
	};
	this.destroy = function(){
		this.alive = false;
	};
	this.draw = function(ctx){
		if (this.alive == false)
			return;
		ctx.save();
		ctx.translate(this.shape.pos.x + (this.width/2), this.shape.pos.y + (this.height/2));
		ctx.rotate(this.angle);
		ctx.drawImage(this.img, -(this.width/2), -(this.height/2));
		ctx.restore();
		
		ctx.save();
		ctx.translate(this.shape.pos.x + (tankTurret.width/2), this.shape.pos.y + (tankTurret.height/2));
		ctx.rotate(this.turretAngle);
		ctx.drawImage(tankTurret, -(tankTurret.width/2), -(tankTurret.height/2));
		ctx.restore();	
	};
};
/*Shot class *********************************************************************************/
function Shot(img, id, ownerKey, incVector, position){
	this.img = img;
	this.iVector = null;
	this.bounceCount = 0;
	this.shape = new Shape();
	this.shape.pos = null;
	this.id = 0;
	this.ownerKey = "";
	this.destroyXmtFunc = null;

	if (incVector)
		this.iVector = incVector;
	else
		this.iVector = new Vector2(0, 0);
	if (position)
		this.shape.pos = position;
	else
		this.shape.pos = new Point(0, 0);
	if (id)
		this.id = id;
	if (ownerKey)
		this.ownerKey = ownerKey;
	
	/*the shot will be in the shape of a square, for now.*/
	this.shape.addVertex(new Vector2(0,0));//First vertex will be top left, which should be the same as the current position. Move clockwise from here.
	this.shape.addVertex(new Vector2(this.img.width,0));//top right
	this.shape.addVertex(new Vector2(this.img.width,this.img.height));//bottom right
	this.shape.addVertex(new Vector2(0,this.img.height));//bottom left
	
	this.bottom = function(){
		return this.shape.pos.y + this.img.height;
	}
	this.left = function (){
		return this.shape.pos;
	};
	this.right = function(){
		return this.shape.pos.x + this.img.width;
	}
	this.topLeft = function(){
		return this.shape.pos;
	};
	this.topRight = function(){
		return new Vector2(this.right(), this.shape.pos.y);
	};	
	this.bottomLeft = function(){
		return new Vector2(this.shape.pos.x, this.bottom());
	};
	this.bottomRight = function(){
		return new Vector2(this.right(), this.bottom());
	};	
	this.bounceX = function(){
		this.iVector.x *= -1;
		this.bounceCount++;
	}
	this.bounceY = function(){
		this.iVector.y *= -1;
		this.bounceCount++;
	}
	this.destroy = function(xmtDestruction){
		this.bounceCount = 1000;
		if (xmtDestruction && xmtDestruction == false)
			return;
		if (this.destroyXmtFunc)
			this.destroyXmtFunc(this);
	}
	this.draw = function(ctx){
		ctx.drawImage(this.img, this.shape.pos.x, this.shape.pos.y);
	};
};
/*KeyboardState class *********************************************************************************/
function keyboardState()
{
	this.downKeys = new Array();
	this.keyListener = null;
	this.isKeyDown = function (key)
	{
		var i = 0;
		for (i = 0; i < this.downKeys.length; i++)
		{
			if (this.downKeys[i] == key)
				return true;
		}
		return false;
	};
	
	this.keyPressed = function (key)
	{
		if (this.isKeyDown(key) == true)
			return;
		this.downKeys.push(key);
	};
	
	this.keyReleased = function (key)
	{
		var i = 0;
		for (i = 0; i < this.downKeys.length; i++)
		{
			if (this.downKeys[i] == key)
			{
				this.downKeys.splice(i, 1);
				return;
			}
		}		
	};
	this.getPressedKeyMask = function(){
		var dMask = 0;
		if (this.isKeyDown(65) || this.isKeyDown(97) || this.isKeyDown(37))
			dMask |= Direction.left;
		if (this.isKeyDown(68) || this.isKeyDown(100) || this.isKeyDown(39))
			dMask |= Direction.right;
		if (this.isKeyDown(83) || this.isKeyDown(115) || this.isKeyDown(40))
			dMask |= Direction.down;
		if (this.isKeyDown(87) || this.isKeyDown(119) || this.isKeyDown(38))
			dMask |= Direction.up;		
		return dMask;
	};	
};