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

tankTurret.src = './images/tankTurret.png';
tankBaseBlue.src = './images/tankBaseBlue.png';
tankBaseYellow.src = './images/tankBaseYellow.png';
tankBaseGreen.src = './images/tankBaseGreen.png';
tankBaseOrange.src = './images/tankBaseOrange.png';
tankBasePurple.src = './images/tankBasePurple.png';

bgImg.src = './images/background.jpg'; // Set source path  
bullet.src = './images/bullet.png'; // Set source path  
explosion.src = './images/explosion.png';

memCanvas.width = gRight;
memCanvas.height = gBottom;