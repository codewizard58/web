///////////////////////////////////////////////////////////
barGraphBit.prototype = Object.create(control.prototype);

function barGraphBit(bit)
{	control.call(this, bit);

	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval;
		var p;
		var xtmp;
		var tmp;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		xval = b.data;
		
        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			xval = Math.floor( (xval * (b.w))/ 255);
	        ctx.fillRect(b.x,  b.y+(b.h/2)-10, b.w, 20);
	        ctx.fillStyle = "#00ff00";
			xtmp = xval;
	        ctx.fillRect(b.x,  b.y+(b.h/2)-10, xtmp, 20);
		}else {
			xval = Math.floor( (xval * (b.h))/ 255);
	        ctx.fillRect(b.x+(b.w/2)-10, b.y, 20, b.h);
	        ctx.fillStyle = "#00ff00";
			xtmp = xval;
	        ctx.fillRect(b.x+(b.w/2)-10, b.y+b.h-xtmp, 20, xtmp);	// 255 at top..
		}
        ctx.fillStyle = "#000000";
	}

		
}


function m_hex(data)
	{
		let val = (0x100+Math.floor(data)).toString(16);
		return val.substring(1);

	}


function m_color(data, contrast, bright)
{	let msg="";

	if( data < 0){
		data = - data % 256;
	}else if( data > 255){
		data = data % 256;
	}

	data = Math.floor(data);
	if( data == 0){
		return "#000000";
	}else if( data >= 254){
		return "#ffffff";
	}
	if( data < 80){
		msg = "#00"+m_hex(data*contrast+bright)+m_hex((80-data)*contrast+bright);		// blue green
	}else if( data < 160){
		msg = "#"+m_hex(contrast*(data-80)+bright) +m_hex(contrast*(160-data) +bright)+"00";	// red green
	}else if( data < 240){
		msg = "#"+m_hex(contrast*(240-data)+bright)+"00"+m_hex(contrast*(data-160) +bright);	// red blue
	}else {	// greys
		msg = "#"+m_hex((data-240)*16)+m_hex((data-240)*16)+m_hex((data-240)*16);
	}
// debugmsg("m_color: "+data+" "+bright+" "+contrast+" = "+msg );
	return msg;
}

lightBit.prototype = Object.create(control.prototype);

function lightBit(bit)
{	control.call(this, bit);
	this.shape = 1;
	this.bright = 40;
	this.contrast = 1.5;

	
	this.Draw = function( )
	{	let b = this.bit;
		let xval;
		let midx;
		let midy;
		

		if( b == null){
			return;
		}

		xval = b.data;
		midx = b.x+b.w/2;
		midy = b.y+b.h/2;
		
//		debugmsg("m_color: "+xval+"="+m_color(xval));
        ctx.fillStyle = m_color(xval, this.contrast, this.bright);
		if( this.shape == 0){
			// square
			ctx.fillRect(b.x, b.y, b.w, b.h);
		}else if( this.shape ==1 ){
			// circle
			ctx.beginPath();
			ctx.arc(midx, midy, b.w/2-5, 0, Math.PI*2);
			ctx.fill();
		}
        ctx.fillStyle = "#000000";
	}

		
}

mandleBit.prototype = Object.create(control.prototype);

function mpoint(x, y)
{
	this.x = x;
	this.y = y;
}

function UImandelReset()
{
	if( bitformaction == null){
		return;
	}
	bitformaction.startx = -2.5;
	bitformaction.starty = -1.5;
	bitformaction.endx = 0.5;
	bitformaction.endy = 1.5;
	bitformaction.initx = 0.0;
	bitformaction.inity = 0.0;
	bitformaction.wx = bitformaction.endx-bitformaction.startx;
	bitformaction.wy = bitformaction.endy-bitformaction.starty;

	UIrefresh(1, 0);
}

function UImandelDebug()
{
	if( bitformaction == null){
		return;
	}
	bitformaction.debug();
}

// map 0-255 into a color. See m_color()
var redMap = [];
var greenMap = [];
var blueMap = [];

function setColorMaps()
{	let gen = 0;
	let data;
	let r,g,b;

	if( redMap.length == 0){
		redMap = new Uint8Array(256);
		gen = 1;
	}
	if( greenMap.length == 0){
		greenMap = new Uint8Array(256);
		gen = 1;
	}
	if( blueMap.length == 0){
		blueMap = new Uint8Array(256);
		gen = 1;
	}
	if(gen == 0){
		return;
	}

	// calculate the color maps
	for(data = 0; data < 256; data ++){
		if( data == 0){
			r = 0;
			g = 0;
			b = 0;
		}else if( data >= 254){
			return "#ffffff";
		}
		if( data < 80){
			r = 0;
			g = data;
			b = 80-data;
		}else if( data < 160){
			r = data - 80;
			g = 160 - data;
			b = 0;
		}else if( data < 240){
			r = 240-data;
			g = 0;
			b = data-160;
		}else {	// greys
			r = (data-240)*16;
			g = (data-240)*16;
			b = (data - 240)*16;
		}
		redMap[data] = r;
		greenMap[data] = g;
		blueMap[data] = b;
	}
}


function mandleBit(bit)
{	control.call(this, bit);
	this.shape = 0;
	this.bright = 0;
	this.x = 0.0;
	this.y = 0.0;
	this.points = [];
	this.startx = -2.5;
	this.starty = -1.5;
	this.endx = 0.5;
	this.endy = 1.5;
	this.initx = 0.0;
	this.inity = 0.0;
	this.ix = 255;		// chan 0 value, initx is adjusted value
	this.iy = 255;
	this.dix = new delta();
	this.diy = new delta();
	this.wx = this.endx-this.startx;
	this.wy = this.endy-this.starty;

	this.cnt = 0;
	this.max = 0;
	this.image = null;
	this.data = null;
	this.done = false;
	this.values = [];
	this.zoom = 1;
	this.reps = 50;
	this.beats = 32;
	this.contrast = 255 / this.reps;
	this.sampler = new sampler();
	this.sx = 0;		// values to draw, based on sampler position, set in setValue.
	this.sy = 0;
	this.transport = new transport();
	this.gate = 128;

	this.power = 2;


	this.sampler.setSize(this.bit.w, this.bit.h);


	this.mapx = function(y)
	{	let sy= this.wx;		// width of area
		let y0 = y-this.startx;
		let y1= 256 * (y0 / sy);
	
//		debugmsg("Y0="+y0+" Y1="+y1+" sy="+sy);

		return checkRange(Math.floor(y1) );
	}

// map value in bit to 0 - 255
	this.mapy = function(y)
	{	let sy= this.wy;		// height of area
		let y0 = y-this.starty;
		let y1= 256 * (y0 / sy);
	
//		debugmsg("Y0="+y0+" Y1="+y1+" sy="+sy);

		return checkRange( Math.floor(y1));
	}



	this.mandle = function()
	{	let a, b;
		let x,y;

		if( this.power == 2){	// mandelbrot
			a = this.x * this.x - this.y * this.y + this.initx;
			b = 2.0 * this.x * this.y + this.inity;
		}else if( this.power == 3){	// burning ship
			x = this.x;
			if (x < 0){
				x = -x;
			}
			y = this.y;
			if(y < 0){
				y = -y;
			}
			a = x * x - y * y + this.initx;
			b = 2.0 * x * y + this.inity;
		}else {
			a = this.x * this.x* this.x - 3*this.x * this.y * this.y + this.initx;
			b = 3.0 * this.x * this.x * this.y - this.y* this.y * this.y  + this.inity;
		}

		if( a < -3.0 || a > 3.0 || b < -3.0 || b > 3.0 || this.cnt > this.reps){
			this.x = 0.0;
			this.y = 0.0;
			this.done = true;
		}else {
			this.x = a;
			this.y = b;
		}
	}

	// create the points
	this.doMandel = function()
	{	const b = this.bit;
		let x;
		let y;
		let idx;
		let max = 0;

		if( b == null){
			return;
		}

		if( this.shape == 0){		// mandelbrot path.
			if( this.dix.changed(this.ix) || this.diy.changed(this.iy)){
				this.done = false;
				this.cnt = 0;
				this.x = 0.0;
				this.y = 0.0;

//				debugmsg("Start new path "+this.ix+" "+this.iy);
			}
			while( !this.done){
				this.mandle();
				if( this.cnt < this.beats){
					this.values[this.cnt] = this.mapy(this.y);
					this.points[this.cnt] = new mpoint( this.mapx(this.x), this.mapy(this.y) );
					max = this.cnt;
				}
				this.cnt++;
				if( this.done){
					this.cnt = 0;
					this.points[this.cnt] = new mpoint( this.mapx(this.initx), this.mapy(this.inity) );

					this.sampler.setPoints( this.points, max);
					this.sampler.setValues( this.values, max);
				}
			}
		}else if( this.shape == 1){		// radial line
			if( this.dix.changed(this.ix) || this.diy.changed(this.iy)){
				this.sampler.radial(this.ix, this.iy);

				this.done = true;
				this.cnt = 0;
			}
		}

	}

	this.resetPath = function(shape)
	{
		this.done = false;
		this.cnt = 0;
		this.x = 0.0;
		this.y = 0.0;
		this.image = null;
		this.data = null;
		this.dix.changed(257);
		debugmsg("New shape "+shape);

	}

	// mandelbrot
	// called about 100 times a second from execProgram.
	this.setValue = function(data, chan)
	{	let b = this.bit;
		let d = checkRange(data);  // 0-255
		let max;
		let points;

		if(b == null){
			return;
		}

		if( chan == 0){
			this.ix = d; 
			this.initx = (d / 256.0)  * this.wx + this.startx;
		}else if( chan == 1){
			this.iy = d;
			this.inity = (d / 256.0)  * this.wy  + this.starty; 

			this.doMandel();
		}

		this.tick = this.sampler.position();
		max  = this.sampler.max;
		points = this.sampler.points;

		if( this.tick < 0){
			this.tick = 0;
		}else if( this.tick > max){
			this.tick = 0;
			if( max > 0){
				this.tick = max -1;
			}
		}

		if( max > 0){
			this.sx = Math.floor(points[this.tick].x * b.w/256) + b.x;
			this.sy = Math.floor(points[this.tick].y * b.h/256) + b.y;
		}
//		debugmsg("TR "+this.transport.trigger+" "+this.tick+" "+this.transport.value+" "+this.transport.delta);
		if( this.transport.trigger > 0){
			this.transport.trigger--;
			b.value = this.sampler.getValue();
		}
		if( this.transport.value > this.gate){
			b.value = 0;
		}
}

	this.fetchImage = function()
	{	let stepx, stepy;
		let ix,iy;
		let x, y;
		let cnt;
		let n;		// index to data
		let b = this.bit;

		if(b==null){
			return;
		}

		this.image = ctx.createImageData(b.w, b.h);
		this.data = new Uint8Array(b.w*b.h);

		stepx = (this.wx) / b.w;
		stepy = (this.wy) / b.h;

		iy = 0;
		ix = 0;
		n = 0;
		for( y = this.starty; y < this.endy; y += stepy){
			for(x=this.startx; x < this.endx; x += stepx){
				this.cnt = 0;
				this.x = 0.0;
				this.y = 0.0;
				this.initx = x;
				this.inity = y;
				cnt = 1;
				this.done = false;
				this.mandle();

				while(!this.done && cnt < this.reps){
					cnt++;
					this.mandle();
				}
				this.data[n] = cnt;

//				c = m_color(cnt*8, 3, this.bright);

				if( iy < this.image.data.length){
					this.image.data[iy+0] = (redMap[cnt]*this.contrast+this.bright) % 256; // red
					this.image.data[iy+1] = (greenMap[cnt]*this.contrast+this.bright) % 256;
					this.image.data[iy+2] = (blueMap[cnt]*this.contrast+this.bright) % 256;
					this.image.data[iy+3] = 255;	// alpha
				}

				iy += 4;
				n++;
			}
			ix++;
			n = ix*b.w;
			iy = n *4;
		}
		this.sampler.setImage(this.image);
		this.sampler.setData(this.data);
	}

	this.setTempo = function(t)
	{
//		debugmsg("SETTEMPO "+t);
		this.transport.setTempo(t, 1);
	}

// mandelbrot
	this.HitTest = function(x, y)
	{	let res = null;
		let b = this.bit;
		let border = 10;

//		debugmsg("HT "+x+" "+y+" X="+b.x+" Y="+b.y+" w "+b.w+" h "+b.h);
		if( b == null){
			return null;
		}
		if( (x >= b.x+border) && x <= (b.x+b.w-border) &&
		    y >= (b.y+border) && y <= (b.y+b.h-border)){
			res = this;
		}
		return res;
	}



// mandelbrot
	this.Draw = function( )
	{	const b = this.bit;
		let cnt = 0;
		let len = 0;
		let x=1;
		let y;
		let points;
		let max;
	

		if( b == null){
			return;
		}

		if( this.image == null){
			this.fetchImage();
		}
		
		if(this.image != null){
			ctx.putImageData(this.image, b.x, b.y);
		}
		points = this.sampler.points;
		max  = this.sampler.max;
		
		ctx.strokeStyle = "#ff0000";			// red
		ctx.lineWidth = 2;
// bounding box
		ctx.strokeRect(b.x, b.y, b.w, b.h);

		if( points.length == 0){
			ctx.fillStyle = "#000000";
			return;
		}
		len = max;
		if( len > points.length){
			debugmsg("Len "+len+" "+points.length);
			len = points.length;
		}

		ctx.beginPath();
		for(cnt = 0; cnt < len; cnt++)
		{	x = 0;
			y = 1;
			// points, 0,0 = left,top  255,255 = right,bottom
			y = Math.floor(points[cnt].y * b.h/256) + b.y;
			x = Math.floor(points[cnt].x * b.w/256) + b.x;
			ctx.lineTo( x, y);
		}
		ctx.stroke();

		x = this.sx;
		y = this.sy;
		ctx.strokeRect(x, y, 4, 4);

		ctx.fillStyle = "#000000";

		drawmode = 2;
	}


// mandle
	this.setData = function()
	{	let msg="";

		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){

			msg = "<table>";
			msg += "<tr><th>Shape</th><td><select id='shape'  onchange='UIrefresh(1, 0);' ><option value='0' "+isSelected(this.shape, 0)+">Mandelbrot Path</option>";
			msg += "<option value='1' "+isSelected(this.shape, 1)+">Mandelbrot Line</option>";
			msg += "<option value='2' "+isSelected(this.shape, 2)+">Image mode</option>";
			msg += "</select></td></tr>";
			msg += "<tr><th>Power</th><td><select id='power'  onchange='UIrefresh(1, 0);' >";
			msg += "<option value='2' "+isSelected(this.power, 2)+">Power 2</option>";
			msg += "<option value='3' "+isSelected(this.power, 3)+">Burning ship</option>";
			msg += "<option value='3' "+isSelected(this.power, 4)+">Cubic (3)</option>";
			msg += "</select></td></tr>";
			msg += "<tr><th>Zoom</th><td><select id='zoom'><option value='1' "+isSelected(this.zoom, 1)+">In</option><option value='2' "+isSelected(this.zoom, 2)+">Out</option></select></td>";
			msg += "<td><input type='button' value='Reset' onclick='UImandelReset(1, 0);' /></td></tr>\n";
			msg += "<tr><th>PingPong</th><td><input type='checkbox' id='pingpong' "+isChecked(this.sampler.pingpong)+" /></td>";
			msg += "<th>Depth</th><td><input type='text' id='reps' value='"+this.reps+"' onchange='UIrefresh(1, 0);'  size='4' /></td></tr>";
			msg += "<tr><th>Tempo</th><td><input type='text' value='"+this.transport.tempo+"' id='tempo' onchange='UIrefresh(1, 0);'  size='4' /></td>";
			msg += "<th>Gate</th><td><input type='text' value='"+this.gate+"' id='gate' onchange='UIrefresh(1, 0);' size='4' /></td></tr>";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	}

	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let s = new saveargs();

		s.addnv("control", "'mandelbrot'");

		f = document.getElementById("shape");
		if( f != null){
			s.addarg("shape");
			s.addarg(f.value);
		}
		f = document.getElementById("power");
		if( f != null){
			s.addarg("power");
			s.addarg(f.value);
		}
		f = document.getElementById("zoom");
		if( f != null){
			s.addarg("zoom");
			s.addarg(f.value);
		}
		f = document.getElementById("reps");
		if( f != null){
			s.addarg("depth");
			s.addarg(f.value);
		}
		f = document.getElementById("tempo");
		if( f != null){
			val = f.value;
			if( val < 40){
				val = 40;
			}else if( val > 240){
				val = 240;
			}
			s.addarg("tempo");
			s.addarg( val);
		}
		f = document.getElementById("gate");
		if( f != null){
			s.addarg("gate");
			s.addarg(f.value);
		}
		f = document.getElementById("pingpong");
		if( f != null){
			s.addarg("pingpong");
			if( f.checked){
				s.addarg(1);
			}else {
				s.addarg(0);
			}
		}

		this.doLoad(s.getdata(), 0);

	}



	this.startMove = function()
	{	let b = this.bit;
		let sx = this.wx;
		let sy = this.wy;
		let ix = ((mx - b.x ) / b.w)*sx + this.startx;
		let iy = ((my - b.y ) / b.h)*sy+ this.starty;


		if( b == null){
			return;
		}

		if( this.shape == 0 || this.shape == 1){	// mandelbrot set
			sx = sx / 2.0;
			sy = sy / 2.0;

			this.startx = ix - sx;
			this.starty = iy - sy;
			this.endx = ix+sx;
			this.endy = iy+sy;

			if( this.zoom == 1){		// zoom in
				this.startx += sx/5;
				this.starty += sy/5;
				this.endx -= sx/5;
				this.endy -= sy/5;
			}else if(this.zoom == 2){	// zoom out
				this.startx -= sx/5;
				this.starty -= sy/5;
				this.endx += sx/5;
				this.endy += sy/5;

			}

			this.wx = this.endx - this.startx;
			this.wy = this.endy - this.starty;

			this.image = null;
			this.data = null;
			this.done = false;
			this.cnt = 0;
			this.x = this.initx;
			this.y = this.inity;
	}else if( this.shape ==2){

		}
	}

	this.stopMove = function()
	{
		
	}

	// mandelbrot
	this.doSave = function()
	{	let msg = "";
		let s = new saveargs();

		s.addnv("control", "'mandle'");
		s.addnv("shape", this.shape);
		s.addnv("zoom", this.zoom);
		s.addnv("depth", this.reps);
		s.addnv("tempo", this.transport.tempo);
		s.addnv("gate", this.gate);

		s.addnv("startx", this.startx);
		s.addnv("starty", this.starty);
		s.addnv("endx", this.endx);
		s.addnv("endy", this.endy);
		if( this.sampler.pingpong){
			s.addnv("pingpong", 1);
		}else {
			s.addnv("pingpong", 0);
		}

//		debugmsg("Mandle "+s.getargs());

		return s.getargs();
	}


	this.doLoad = function(initdata, idx)
	{	let len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";

		// first element is length
		for(n=1; n < len; n += 2){
			param = initdata[idx+n];
			val = initdata[idx+n+1];

			if( param == "shape"){
				if(val != this.shape){
					this.resetPath(val);
				}
				this.shape = val;
			}else if(param == "tempo"){
				this.setTempo(val);
			}else if(param == "power"){
				if( val != this.power){
					this.resetPath(this.shape);
				}
				this.power = val;
			}else if(param == "gate"){
				if( val < 10){
					val = 10;
				}
				this.gate = checkRange(val);
			}else if(param == "zoom"){
				this.zoom = val;
			}else if(param == "depth"){
				if( val < 10){
					val = 10;
				}
				if( val > 255){
					val = 255;
				}
				if( val != this.reps){
					this.resetPath(this.shape);
				}
				this.reps = val;
			}else if(param == "startx"){
				this.startx = val;
			}else if(param == "starty"){
				this.starty = val;
			}else if(param == "endx"){
				this.endx = val;
			}else if(param == "endy"){
				this.endy = val;
			}else if(param == "pingpong"){
				if( val == 1){
					this.sampler.pingpong = true;
				}else {
					this.sampler.pingpong = false;
				}
			}


		}
		// init other values
		this.tick = 0;
		this.image = null;		// regenerate image.
		this.wx = this.endx-this.startx;
		this.wy = this.endy-this.starty;
		this.ix = 0;
		this.iy = 0;
	}

	setColorMaps();		// init the colour maps.
	this.setTempo(120);
	timer_list.addobj(this.transport, null);
	this.transport.resume();


}



