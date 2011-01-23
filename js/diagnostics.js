function diagnostics(){
	this.delta = 0;
	this.lastTime = (new Date()).getTime();
	this.frames = 0;
	this.totalTime = 0;
	this.updateTime = 0;
	this.updateFrames =0;

	this.update = function(){
		if ($('#fps').length <= 0){
			el = $('<div id="fps"></div>')
			el.id = 'fps';
			el.appendTo('body');
		}
	    var now = (new Date()).getTime();
	    this.delta = now-this.lastTime;
	    this.lastTime = now;
	    this.totalTime+=this.delta;
	    this.frames++;
	    this.updateTime+=this.delta;
	    this.updateFrames++;
	    if(this.updateTime > 1000) {
	        $('#fps').html("FPS AVG: " + (1000*this.frames/this.totalTime) + "<br>CUR FPS: " + (1000*this.updateFrames/this.updateTime));
	        this.updateTime = 0;
	        this.updateFrames =0;
	    }	
	}	
}