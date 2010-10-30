function sprite(img, frameSize, startCell, endCell){
	this.img = img;
	this.frameSize = frameSize;
	this.startCell = startCell;
	this.endCell = endCell;
	this.curCell = startCell;
	this.playSpeed = 100;
	this.loop = false;
	this.lastFrameTime = 0;
	this.pos = new Vector2(0, 0);
	this.finished = false;
	
	this.draw = function (ctx){
		if (this.curCell.col > endCell.col){
			this.finished = true;
			return;
		}
		//drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
		ctx.drawImage(	this.img, this.getCurX(), this.getCurY(), this.frameSize, this.frameSize, 
						this.pos.x, this.pos.y, this.frameSize, this.frameSize);
		var curTime = new Date().getTime();
		if (curTime - this.lastFrameTime >= this.playSpeed){
			this.lastFrameTime = curTime;
			this.curCell = this.getNextCell();
		}
	};
	this.getTime = new function(){
		var date = new Date();
		return date.getTime();
	};
	this.getCurX = function(){
		return this.curCell.col * this.frameSize;
	};
	this.getCurY = function(){
		return this.curCell.row * this.frameSize;
	};	
	this.getNextCell = function(){
		var next = this.curCell;
		next.col++;
		if (next.col > this.endCell.col){
			next.col = this.startCell.col;
			next.row++;
		}
		if (this.loop == true && next.row > this.endCell.row){
			next.col = this.startCell.col;
			next.row = this.startCell.row;
		}
		return next;
	};
	this.reset = function (){
		this.curCell.col = this.startCell.col;
		this.curCell.row = this.startCell.row;	
	};
};