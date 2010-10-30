function block(img, x, y){
	this.pos = new Point(x, y);
	this.img = img;
	
	this.top = function (){
		return this.pos;
	};
	this.bottom = function(){
		return this.pos.y + this.img.height;
	};
	this.left = function (){
		return this.pos;
	};	
	this.right = function(){
		return this.pos.x + this.img.width;
	};
	this.topLeft = function(){
		return this.pos;
	};
	this.topRight = function(){
		return new Vector2(this.right(), this.pos.y);
	};	
	this.bottomLeft = function(){
		return new Vector2(this.pos.x, this.bottom());
	};
	this.bottomRight = function(){
		return new Vector2(this.right(), this.bottom());
	};	
}