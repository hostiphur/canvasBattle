function level1(){
	this.normalBlock = new Image();
	this.normalBlock.src = ("./images/normalBlock.png");
	this.normalBlockHeight = 32;
	this.normalBlockWidth = 32;
	this.levelWidth = 800;
	this.levelHeight = 600;
	var xTrail = 350;
	var yTrail = 50;
	//The shape of the wall on the left side of the screen.
	var wall1Shape = new Shape([{x: 100, y: yTrail},//position (top left point)
								{x: 0, y: 0},//top left corner
								{x: this.normalBlockWidth, y: 0},//top right
								{x: this.normalBlockWidth, y: this.normalBlockHeight*7},//bottom right
								{x: 0, y: this.normalBlockHeight*7}]);//bottom left
	
	
	this.objects = [new block(this.normalBlock, 100, yTrail),
					new block(this.normalBlock, 100, yTrail+=this.normalBlockHeight),
					new block(this.normalBlock, 100, yTrail+=this.normalBlockHeight),
					new block(this.normalBlock, 100, yTrail+=this.normalBlockHeight),
					new block(this.normalBlock, 100, yTrail+=this.normalBlockHeight),
					new block(this.normalBlock, 100, yTrail+=this.normalBlockHeight),
					new block(this.normalBlock, 100, yTrail+=this.normalBlockHeight),
					new block(this.normalBlock, xTrail = 350, yTrail = 250),
					new block(this.normalBlock, xTrail+=this.normalBlockWidth, yTrail-=this.normalBlockHeight),
					new block(this.normalBlock, xTrail+=this.normalBlockWidth, yTrail-=this.normalBlockHeight),
					new block(this.normalBlock, xTrail+=this.normalBlockWidth, yTrail-=this.normalBlockHeight),
					new block(this.normalBlock, xTrail+=this.normalBlockWidth, yTrail-=this.normalBlockHeight),
					new block(this.normalBlock, xTrail+=this.normalBlockWidth, yTrail+=this.normalBlockHeight),
					new block(this.normalBlock, xTrail+=this.normalBlockWidth, yTrail+=this.normalBlockHeight),
					new block(this.normalBlock, xTrail+=this.normalBlockWidth, yTrail+=this.normalBlockHeight)];
	xTrail = 350;
	yTrail = 250;
	this.shapes = [	wall1Shape,
					new Shape([	{x: 0, y: 0},
								{x: 0, y: -1},
								{x: this.levelWidth, y: -1},
								{x: this.levelWidth, y: 0},
								{x: 0, y: 0}]),//top world boundary
					new Shape([	{x: 0, y: 0},
								{x: -1, y: 0},
								{x: -1, y: this.levelHeight},
								{x: 0, y: this.levelHeight},
								{x: 0, y: 0}]),//left world boundary
					new Shape([	{x: 0, y: this.levelHeight},
								{x: 0, y: 0},
								{x: this.levelWidth, y: 0},
								{x: this.levelWidth, y: -1},
								{x: 0, y: -1}]),//bottom world boundary
					new Shape([	{x: this.levelWidth, y: 0},
								{x: 0, y: 0},
								{x: 1, y: 0},
								{x: 1, y: this.levelHeight},
								{x: 0, y: this.levelHeight}]),//right world boundary								
					new Shape([	{x: xTrail+=this.normalBlockWidth, y: yTrail-=this.normalBlockHeight},
								{x: 0, y: 0},
								{x: this.normalBlockWidth, y: 0},
								{x: this.normalBlockWidth, y: this.normalBlockHeight},
								{x: 0, y: this.normalBlockHeight}]),
					new Shape([	{x: xTrail+=this.normalBlockWidth, y: yTrail-=this.normalBlockHeight},
								{x: 0, y: 0},
								{x: this.normalBlockWidth, y: 0},
								{x: this.normalBlockWidth, y: this.normalBlockHeight},
								{x: 0, y: this.normalBlockHeight}]),
					new Shape([	{x: xTrail+=this.normalBlockWidth, y: yTrail-=this.normalBlockHeight},
								{x: 0, y: 0},
								{x: this.normalBlockWidth, y: 0},
								{x: this.normalBlockWidth, y: this.normalBlockHeight},
								{x: 0, y: this.normalBlockHeight}]),
					new Shape([	{x: xTrail+=this.normalBlockWidth, y: yTrail-=this.normalBlockHeight},
								{x: 0, y: 0},
								{x: this.normalBlockWidth, y: 0},
								{x: this.normalBlockWidth, y: this.normalBlockHeight},
								{x: 0, y: this.normalBlockHeight}]),
					new Shape([	{x: xTrail+=this.normalBlockWidth, y: yTrail+=this.normalBlockHeight},
								{x: 0, y: 0},
								{x: this.normalBlockWidth, y: 0},
								{x: this.normalBlockWidth, y: this.normalBlockHeight},
								{x: 0, y: this.normalBlockHeight}]),
					new Shape([	{x: xTrail+=this.normalBlockWidth, y: yTrail+=this.normalBlockHeight},
								{x: 0, y: 0},
								{x: this.normalBlockWidth, y: 0},
								{x: this.normalBlockWidth, y: this.normalBlockHeight},
								{x: 0, y: this.normalBlockHeight}]),
					new Shape([	{x: xTrail+=this.normalBlockWidth, y: yTrail+=this.normalBlockHeight},
								{x: 0, y: 0},
								{x: this.normalBlockWidth, y: 0},
								{x: this.normalBlockWidth, y: this.normalBlockHeight},
								{x: 0, y: this.normalBlockHeight}]),
					new Shape([	{x: 500, y: 400},
								{x: 100, y: 0},
								{x: 200, y: 100},
								{x: 100, y: 200},
								{x: 0, y: 100}]),
					new Shape([	{x: 200, y: 300},
								{x: 25, y: 0},
								{x: 50, y: 0},
								{x: 75, y: 25},
								{x: 75, y: 50},
								{x: 50, y: 75},
								{x: 25, y: 75},
								{x: 0, y: 50},
								{x: 0, y: 25}])];
	this.drawShapes = function(ctx){
		var prevColor = ctx.fillStyle;
		ctx.fillStyle = "#4D2E0D";
		for (i = 0; i < this.shapes.length; i++){
			var cur = this.shapes[i];
			ctx.beginPath();
			var startPoint = null;
			for (j = 0; j < this.shapes[i].vertices.length; j++){
				var point = cur.getVertexPoint(j);
				if (j == 0){
					startPoint = point;
					ctx.moveTo(point.x, point.y);
				}
				else{
					if (cur.collisionFace == j)
						ctx.moveTo(point.x, point.y);
					else
						ctx.lineTo(point.x, point.y);
				}
			}
			ctx.lineTo(startPoint.x, startPoint.y);
			ctx.fill();
		}
		ctx.fillStyle = prevColor;
	};
}