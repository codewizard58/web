// label and map bits
//
function getTextWidth(text, size, font) {
    // re-use canvas object for better performance
	let msg = ""+size+"px "+font;
    ctx.save();
	ctx.font = msg;
    return ctx.measureText(text);
};

function getfontsize( w, font)
{	let w12 = getTextWidth(m68+"MMMMMMMMMM", 12, "Courier");
	var x = (w-20) / w12;

	return Math.floor( x * 12);
}


labelBit.prototype = Object.create(control.prototype);

function labelBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.label = "Text here";
	this.paramnames = ["control", "label", "background", "font", "face", "color"];
	this.fontsize = 20;
	this.face = "courier";

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let bt = b.btype & 7;	// 0 = horiz, 1 == vert

		if( bt == 0){
			x = x - 39;
			y = y - 15;
		}else {
			x = x - 39;
			y = y - 10;
		}

		if( x > 0 && x < 20 && y > 0 && y < 20 ){
			this.initx = mx;
			this.inity = my;
			this.ival = this.nfreq;
			return this;
		}

		return null;
	}


    this.Draw = function( )
	{	let b = this.bit;
		let bt = b.btype & 7;	// 0 = horiz, 1 == vert

		if( b == null){
			return;
		}
		ctx.save();

		ctx.fillStyle = this.background;
		ctx.fillRect(b.x, b.y, b.w, b.h);	

		ctx.font=this.font;
        b.drawText(ctx, this.label);
		ctx.restore();
    }

    this.setData = function()
	{	let msg="";
		
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th align='right'>Label</th><td ><input type='text' id='label' value='"+this.label+"' size='10' /></td></tr>\n";
			msg += "<tr><th align='right'>Background</th><td ><input type='text' id='ctrlbk' value='"+this.background+"' size='10' /></td></tr>\n";
			msg += "<tr><th align='right'>Color</th><td ><input type='text' id='ctrlcol' value='"+this.color+"' size='10' /></td></tr>\n";
			msg += "<tr><th align='right'>Font Size</th><td ><input type='text' id='ctrlfont' value='"+this.fontsize+"' size='4' /></td>";
			msg += "<th align='right'>Font Face</th><td ><input type='text' id='ctrlface' value='"+this.face+"' size='10' /></td>";

			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

    // label
	this.getData = function()
	{	let f = null;
		let b = this.bit;

		if( b == null){
			return;
		}
		bitform = document.getElementById("bitform");
		if( bitform != null && bitformaction == this){
			// match with paramnames
//			this.paramnames = ["control", "label", "background", "font", "color"];
			let nf = [ null, "label", "ctrlbk", "ctrlfont", "ctrlface", "ctrlcol"];
			let i = 0;
			let msg = [];
			let cnt = 1;

			for(i=0; i < nf.length;i++){
				if( nf[i] != null){
					f = document.getElementById(nf[i]);
					if( f != null){
						msg[cnt] = this.paramnames[i];
						msg[cnt+1]= f.value;
						cnt += 2;
					}else {
						debugmsg("getdata not find "+nf[i]);
					}
				}
			}

			msg[0] = cnt;
			this.doLoad(msg, 0);
		}
    }

	this.doSave = function()
	{	let msg = "";
		let s = new saveargs();
		let b = this.bit;

		if( b == null){
			return;
		}
		// strings, numbers
//		this.paramnames = ["control", "label", "background", "font", "color"];
		let vs = ["label", this.label, this.background, this.font, this.color];
		let vn =[0,0,0,0,0];
		let i = 0;

		for(i=0; i < this.paramnames.length; i++){
			if( vs[i] != null){
				s.addnv(this.paramnames[i], stringValue(vs[i]));
			}else {
				s.addnv(this.paramnames[i], vn[i]);
			}
		}

		return s.getargs();
	}

	this.doLoad = function(initdata, idx)
	{	let len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";
		let b = this.bit;
		let metrics;

		if( b == null){
			return;
		}

//		debugmsg("LABEL doload "+idx+" "+len);
//		this.paramnames = ["control", "label", "background", "font", "color"];
		for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
			val = initdata[idx+n+1];
//			debugmsg("P "+param+" V "+val);

			if( param == "control"){
				continue;
			}
			if( param == "label"){
				this.label = val;
			}else if( param == "background"){
				this.background = val;
				b.background = val;
			}else if( param == "font"){
				this.fontsize = val;
			}else if( param == "face"){
				this.face = val;
			}else if( param == "color"){
				this.color = val;
				b.color = val;
			}
		}
		b.font = ""+this.fontsize+"px "+this.face;
		metrics = getTextWidth( this.label, this.fontsize, this.face);
//		debugmsg("Metrics h="+metrics.height);
		if( metrics.width > 30){
			b.w = metrics.width+20;
		}else {
			b.w = 50;
		}
	}

}

mapBit.prototype = Object.create(control.prototype);

function mapBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	bit.name = "map";
	this.background = "black";
	this.color = "white";
	this.mw = 800;
	this.mh = 600;

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let rx = (x / b.w ) * this.mw;
		let ry = (y / b.h ) * this.mh;

//		debugmsg("MAP "+x+" "+y+" x="+b.x+" mw="+this.mw+" rx="+rx+" mh="+this.mh+" ry="+ry);

		x = this.scalex( x);
		y = this.scaley( y);
//		debugmsg("__ MAP "+x+" "+y);

		return null;
	}

	// mapbit scale vx to bit size.
	this.scalex = function(vx)
	{	let nx = (vx-sketch.bll) / this.mw;  // distance from
		let b = this.bit;

		return nx * 90;
	}

	this.scaley = function(vy)
	{	let ny = (vy-sketch.blt) / this.mh;  // distance from
		let b = this.bit;

		return ny * 90;
	}

    this.Draw = function( )
	{	let b = this.bit;
		let bt = b.btype & 7;	// 0 = horiz, 1 == vert
		let msg = "";
		let mw;		// map width
		let mh;		// map height
		let bl = sketch.blist;
		let btmp;

		if( b == null){
			return;
		}

		b.x = 25;	// fixed
		b.y = 25;

		ctx.save();

		ctx.fillStyle = this.background;
		ctx.fillRect(b.x, b.y, b.w, b.h);
		
		mw = sketch.blr - sketch.bll;
		mh = sketch.blb - sketch.blt;
		this.mw = mw;
		this.mh = mh;

		// draw each bit on the map
		ctx.fillStyle = this.color;
		while( bl ){
			ctx.fillStyle = this.color;
			btmp = bl.bit;

			if( selected != null && btmp == selected.getDrag() ){
				ctx.fillStyle="red";
			}else if( btmp == dragging){
				ctx.fillStyle="green";
			}
//			debugmsg("MAP "+this.scalex(btmp.x)+" "+this.scaley(btmp.y))
			ctx.fillRect(this.scalex(btmp.x)+this.bit.x, this.scaley(btmp.y)+this.bit.y, 5, 5);

			bl = bl.next;
		}


		ctx.restore();
    }



}


patchinBit.prototype = Object.create(control.prototype);

function patchinBit(bit)
{	control.call(this, bit);
	this.bit = bit;

}


patchoutBit.prototype = Object.create(control.prototype);

function patchoutBit(bit)
{	control.call(this, bit);
	this.bit = bit;

}

