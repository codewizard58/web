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
			msg = "#00"+m_hex(data*contrast+bright)+m_hex((80-data)*contrast+bright);
		}else if( data < 160){
			msg = "#"+m_hex(contrast*(data-80)+bright) +m_hex(contrast*(160-data) +bright)+"00";
		}else if( data < 240){
			msg = "#"+m_hex(contrast*(240-data)+bright)+"00"+m_hex(contrast*(data-160) +bright);
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

function mandleBit(bit)
{	control.call(this, bit);
	this.shape = 0;
	this.bright = 40;
	this.contrast = 1.5;
	this.x = 0.0;
	this.y = 0.0;
	this.points = [];
	this.startx = -2.5;
	this.starty = -1.5;
	this.endx = 0.5;
	this.endy = 1.5;
	this.initx = 0.0;
	this.inity = 0.0;
	this.wx = this.endx-this.startx;
	this.wy = this.endy-this.starty;

	this.cnt = 0;
	this.image = null;
	this.tick = 0;
	this.transport = new transport();
	this.gate = 128;
	this.done = false;
	this.max = 0;
	this.values = [];
	this.zoom = 1;
	this.reps = 200;
	this.beats = 32;


	timer_list.addobj(this.transport, null);


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
	{	let a = this.x * this.x - this.y * this.y + this.initx;
		let b = 2.0 * this.x * this.y + this.inity;

		if( a < -3.0 || a > 3.0 || b < -3.0 || b > 3.0 || this.cnt > this.reps){
			this.x = 0.0;
			this.y = 0.0;
			this.max = this.cnt;
			this.cnt = 0;
			this.done = true;
//			debugmsg("M "+this.x+" "+this.y);
		}else {
			this.x = a;
			this.y = b;

			if( this.shape == 0){
				this.values[this.cnt] = this.mapy(this.y);

				this.points[this.cnt] = new mpoint( this.mapx(a), this.mapy(b) );
			}
			this.cnt++;
		}
	}

	this.doMandle = function()
	{	let cx,cy,dx,dy;
		let b = this.bit;
		let sx,sy;
		let cnt, n;

		if( b == null){
			return;
		}

		if( this.shape == 0){
			if( !this.done){
				this.mandle();
			}
		}else if( this.shape == 1){
			// points on line segment
			cx = b.w/2;
			cy = b.h/2;

			dx = ( this.wx)/2.0 + this.startx;
			dy = ( this.wy)/2.0 + this.starty;		// dx, dy is center 

			sx = (this.initx - dx) / (this.beats -1);
			sy = (this.inity - dy) / (this.beats -1);

			for(cnt=0; cnt < this.beats; cnt++){
				this.cnt = 0;
				this.x = 0.0;
				this.y = 0.0;
				this.initx = dx;
				this.inity = dy;
				this.points[cnt] = new mpoint( this.mapx(dx), this.mapy(dy));
				this.mandle();
				n = 1;
				while(this.cnt != 0 && n < this.reps){
					n++;
					this.mandle();
				}
				this.values[cnt] = n;
				dx += sx;
				dy += sy;
			}
//			debugmsg("sx="+this.startx+" ex="+this.endx+" px="+this.points[this.beats-1].x);
			this.max = cnt;
			this.done = true;
			this.cnt = 0;
		}

	}

	// mandelbrot
	// called about 100 times a second from execProgram.
	this.setValue = function(data, chan)
	{	let x;
		let b = this.bit;
		let d = checkRange(data);  // 0-255  

		if(b == null){
			return;
		}

		if( chan == 0){
			this.initx = (d / 256.0)  * this.wx + this.startx; 
//			debugmsg("D="+d+" dx="+(d / 256.0) );
		}else if( chan == 1){
			this.inity = (d / 256.0)  * this.wy  + this.starty; 

			this.doMandle();
			if( this.transport.gate > 0){
				this.transport.gate--;
				this.tick++;

				this.done=false;
			}
			if( this.tick >= this.max){
				this.tick = 0;

				this.done = false;
			}
			if( this.gate < this.transport.value){
				this.bit.value = 0;
			}else {	
				this.bit.value = this.values[this.tick];
			}

		}

	}

	this.setTempo = function(tempo)
	{
		this.transport.setTempo(tempo, 0.5);
	}

	this.setTempo(240);

	this.HitTest = function(x, y)
	{	let res = null;
		let b = this.bit;

		if( b == null){
			return;
		}
//		debugmsg("HT "+x+" "+y+" X="+b.x+" Y="+b.y+" w "+b.w+" h "+b.h);
		if( (x >= b.x+5) && x <= (b.x+b.w-5) &&
		    y >= (b.y+5) && y <= (b.y+b.h-5)){
			res = this;
		}
		return res;
	}



// mandelbrot
	this.Draw = function( )
	{	let b = this.bit;
		let xval;
		let midx;
		let midy;
		let cnt = 0;
		let len = this.max;
		let x, y;
		let stepx, stepy;
		let ix,iy;
		let c;
		

		if( b == null){
			return;
		}

		xval = b.data;
		midx = b.x+b.w/2;
		midy = b.y+b.h/2;

		if( this.image == null){
			this.image = ctx.createImageData(b.w, b.h);
			stepx = (this.wx) / b.w;
			stepy = (this.wy) / b.h;

			iy = 0;
			ix = 0;
			for( y = this.starty; y < this.endy; y += stepy){
				ix = ix+4*b.w;
				iy = ix;
				for(x=this.startx; x < this.endx; x += stepx){
					this.cnt = 0;
					this.x = 0.0;
					this.y = 0.0;
					this.initx = x;
					this.inity = y;
					cnt = 1;
//					this.done = false;
					this.mandle();
					while(this.cnt != 0 && cnt < this.reps){
						cnt++;
						this.mandle();
					}
					c = m_color(cnt*8, 3, this.bright);

					if( iy < this.image.data.length){
						this.image.data[iy+0] = parseInt("0x"+c.substring(1, 3), 16); // red
						this.image.data[iy+1] = parseInt("0x"+c.substring(3, 5), 16);  // green
						this.image.data[iy+2] = parseInt("0x"+c.substring(5), 16); 	// blue
						this.image.data[iy+3] = 255;	// alpha
					}

					iy += 4;
				}
			}
		}
		
//		debugmsg("m_color: "+xval+"="+m_color(xval));
		if(this.image != null){
			ctx.putImageData(this.image, b.x, b.y);
		}
		ctx.strokeStyle = "#ff0000";			// red
		ctx.lineWidth = 2;

		ctx.strokeRect(b.x, b.y, b.w, b.h);
		if( this.points == null){
			ctx.fillStyle = "#000000";
			return;
		}
		if( this.points.length == 0){
			ctx.fillStyle = "#000000";
			return;
		}
		if( this.shape == 0){
			ctx.beginPath();
			for(cnt = 0; cnt < len; cnt++)
			{
				// points, 0,0 = left,top  255,255 = right,bottom
				x = Math.floor(this.points[cnt].x * b.w/256) + b.x;
				y = Math.floor(this.points[cnt].y * b.h/256) + b.y;
				ctx.lineTo( x, y);
			}
			ctx.stroke();
		}else if( this.shape ==1 ){
			ctx.beginPath();
			for(cnt = 0; cnt < len; cnt++)
			{
				// points, 0,0 = left,top  255,255 = right,bottom
				x = Math.floor(this.points[cnt].x * b.w/256) + b.x;
				y = Math.floor(this.points[cnt].y * b.h/256) + b.y;
				ctx.lineTo( x, y);
			}
			ctx.stroke();
			x = Math.floor(this.points[this.tick].x * b.w/256) + b.x;
			y = Math.floor(this.points[this.tick].y * b.h/256) + b.y;
			ctx.strokeRect(x, y, 4, 4);
		}
        ctx.fillStyle = "#000000";
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
			msg += "<tr><th>Shape</th><td><select id='shape'><option value='0' "+isSelected(this.shape, 0)+">Mandelbrot Path</option><option value='1' "+isSelected(this.shape, 1)+">Mandelbrot Line</option></select></td></tr>"
			msg += "<tr><th>Zoom</th><td><select id='zoom'><option value='1' "+isSelected(this.zoom, 1)+">In</option><option value='2' "+isSelected(this.zoom, 2)+">Out</option></select></td></tr>\n";
			msg += "<tr><th>X</th><td>"+this.initx+"</td>";
			msg += "<th>Y</th><td>"+this.inity+"</td></tr>";
			msg += "<tr><th>Tempo</th><td><input type='text' value='"+this.transport.tempo+"' id='tempo' onchange='UIrefresh(1, 0);' /></td>";
			msg += "<th>Gate</th><td><input type='text' value='"+this.gate+"' id='gate' onchange='UIrefresh(1, 0);' /></td></tr>";

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
		f = document.getElementById("zoom");
		if( f != null){
			s.addarg("zoom");
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

		sx = sx / 2.0;
		sy = sy / 2.0;

		this.startx = ix - sx;
		this.starty = iy - sy;
		this.endx = ix+sx;
		this.endy = iy+sy;

		if( this.zoom == 1){
			this.startx += sx/5;
			this.starty += sy/5;
			this.endx -= sx/5;
			this.endy -= sy/5;
		}else if(this.zoom == 2){
			this.startx -= sx/5;
			this.starty -= sy/5;
			this.endx += sx/5;
			this.endy += sy/5;

		}

		this.wx = this.endx - this.startx;
		this.wy = this.endy - this.starty;


//		debugmsg("IX="+ix+" IY="+iy+" X="+mx+" y="+my);
		this.image = null;
	}

	this.stopMove = function()
	{
		
	}

	this.doSave = function()
	{	let msg = "";
		let s = new saveargs();

		s.addnv("control", "'mandle'");
		s.addnv("shape", this.shape);
		s.addnv("zoom", this.zoom);
		s.addnv("tempo", this.transport.tempo);
		s.addnv("gate", this.gate);

		s.addnv("startx", this.startx);
		s.addnv("starty", this.starty);
		s.addnv("endx", this.endx);
		s.addnv("endy", this.endy);

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
				this.shape = val;
			}else if(param == "tempo"){
				this.setTempo(val);
			}else if(param == "gate"){
				this.gate = checkRange(val);
			}else if(param == "zoom"){
				this.zoom = val;
			}else if(param == "startx"){
				this.startx = val;
			}else if(param == "starty"){
				this.starty = val;
			}else if(param == "endx"){
				this.endx = val;
			}else if(param == "endy"){
				this.endy = val;
			}


		}
		// init other values
		this.tick = 0;
		this.image = null;		// regenerate image.
	}

}



