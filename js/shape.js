function Shape(initObject){
	//A series of vectors that originate at this.pos
	//each vector defines a new vertices.
	this.vertices = new Array();
	/*The top left of the shape. Using top left so that
	I won't have to calculate it when drawing.
	Canvas.draw draws an image using its top left coordinate.*/
	this.pos = new Point(0, 0);
	/*If true this object should never move and is considered immovable.*/
	this.stationary = true;
	this.collisionFace = null;
		
	this.doInit = function (initObject){
		if (!initObject)
			return;
		if (initObject.length <= 0)
			return;
		/*It is expected that the "initObject" will have a series of x y properties.
		the first set is the position of the shape, the rest are vertices.*/
		this.pos.x = initObject[0].x;
		this.pos.y = initObject[0].y;
		if (initObject.length <= 1)
			return;
		var i = 1;
		for (i = 1; i < initObject.length; i++)
			this.addVertex(new Vector2(initObject[i].x, initObject[i].y));
	};
	this.getVertexCount = function(){
		return this.vertices.length;
	};
	/*This will return a point which will indicate where the vertex is
	ACTUALLY located.*/
	this.getVertexPoint = function(ndx){
		if (ndx < 0 || ndx >= this.vertices.length)
			return null;
		return new Point(	this.pos.x + this.vertices[ndx].x,
							this.pos.y + this.vertices[ndx].y);
	};
	this.addVertex = function(vector2){
		this.vertices.push(vector2);
	};
	this.getFaceVector = function(ndx){
		var nextNdx = ndx+1;
		if (ndx == this.vertices.length-1)
			nextNdx = 0;
		
		var p1 = this.getVertexPoint(ndx);
		var p2 = this.getVertexPoint(nextNdx);
		
		var norm = new Vector2(	p1.x - p2.x, p1.y - p2.y);
				
		//normalize
		var tmp = Math.sqrt(norm.x * norm.x + norm.y * norm.y);
		norm.x /= tmp;
		norm.y /= tmp;
		return norm;
	};	
	this.getFaceNormal = function(ndx){
		var nextNdx = ndx+1;
		if (ndx == this.vertices.length-1)
			nextNdx = 0;
		
		var p1 = this.getVertexPoint(ndx);
		var p2 = this.getVertexPoint(nextNdx);
		
		var norm = new Vector2(	p1.y - p2.y, p1.x - p2.x);
				
		//normalize
		var tmp = Math.sqrt(norm.x * norm.x + norm.y * norm.y);
		norm.x /= tmp;
		norm.y /= tmp;
		return norm;
	};
	this.doInit(initObject);
};