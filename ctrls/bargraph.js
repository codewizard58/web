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
	this.x = x*50+100;
	this.y = y*50+100;
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
	this.cnt = 0;
	this.scale = 50;
	this.image = null;
	this.ticks = 0;
	this.speed = 4;

	this.mandle = function()
	{	let a = this.x * this.x - this.y * this.y + this.initx;
		let b = 2.0 * this.x * this.y + this.inity;

		if( a < -4.0 || a > 4.0 || b < -4.0 || b > 4.0 || this.cnt > 32){
			this.x = 0.0;
			this.y = 0.0;
			this.cnt = 0;
//			debugmsg("M "+this.x+" "+this.y);
		}else {
			this.x = a;
			this.y = b;

			this.points[this.cnt] = new mpoint(a, b);
			this.cnt++;
//			debugmsg("P["+this.cnt+"] "+a+" "+b);
		}
	}

	this.doMandle = function()
	{
		this.ticks++;
		if( this.ticks > this.speed){
			if( this.shape == 0){
				this.mandle();
				this.ticks = 0;
			}
		}

	}

	this.setValue = function(data, chan)
	{	
		if( chan == 0){
			this.initx = (data - 128) / 64.0;
//			debugmsg("MANDLE "+this.initx);
		}else if( chan == 1){
			this.inity = (data - 128) / 64.0;

//			this.points[this.cnt] = new mpoint(this.initx, this.inity);
//			this.cnt++;
			this.doMandle();
//			debugmsg("MANDLE2 "+this.inity);
			this.bit.value = this.x*this.scale+128;
		}

	}


	this.Draw = function( )
	{	let b = this.bit;
		let xval;
		let midx;
		let midy;
		let cnt = 0;
		let len = this.cnt;
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
			stepx = (this.endx-this.startx) / b.w;
			stepy = (this.endy-this.starty) / b.h;

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
					this.mandle();
					while(this.cnt != 0 && cnt < 20){
						cnt++;
						this.mandle();
					}
//					debugmsg("X="+x+" Y="+y+" cnt="+cnt+" ["+ix+","+iy+"]");
					c = m_color(cnt*8, this.contrast, this.bright);
//					c = "#ff0000";

					if( iy < this.image.data.length){
						this.image.data[iy+0] = parseInt("0x"+c.substring(1, 3), 16); // red
						this.image.data[iy+1] = parseInt("0x"+c.substring(3, 5), 16);  // green
						this.image.data[iy+2] = parseInt("0x"+c.substring(5), 16); 	// blue
						this.image.data[iy+3] = 255;	// alpha
						// debugmsg("IY="+iy+"R="+this.image[iy+0]+" G="+this.image[iy+1]+" B="+this.image[iy+2]);
					}

					iy += 4;
				}
			}
		}
		
//		debugmsg("m_color: "+xval+"="+m_color(xval));
		if(this.image != null){
			ctx.putImageData(this.image, b.x, b.y);
		}
		ctx.strokeStyle = "#ff0000";
		ctx.lineWidth = 2;
		if( this.shape == 0){
			// square
			ctx.strokeRect(b.x, b.y, b.w, b.h);
			ctx.beginPath();
			for(cnt = 0; cnt < len; cnt++)
			{
				ctx.lineTo( this.points[cnt].x+b.x, this.points[cnt].y+b.y);
			}
			ctx.stroke();
		}else if( this.shape ==1 ){
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
			msg += "<tr><th>Shape</th><td><select id='shape'><option value='0'>Mandelbrot</option><option value='1'>Life</option></select></td></tr>"
			msg += "<tr><th>Zoom</th><td><select id='zoom'><option value='0'>In</option><option value='1'>Out</option></select></td></tr>\n";
			msg += "<tr><th>X</th><td>"+this.startx+"</td></tr>";
			msg += "<tr><th>Y</th><td>"+this.starty+"</td></tr>";

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


	}
}



