// 10/19/24
// 1

function doBitFormAction()
{
    bitform = document.getElementById("bitform");
	if( bitform != null){
		if( bitformaction != null){
			bitformaction.getData();
		}
		bitform.innerHTML = "";
		bitformaction = null;
	}

	bitform = null;
}

///////////////////////////////////////////////////////////
wireBit.prototype = Object.create(control.prototype);

function wireBit(bit)
{	control.call(this, bit);

	this.bit = bit;

// wire
	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval;
		var p;
		var xtmp;
		var tmp;
		var snapname;
		var suffix;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		xval = b.data;
		
        ctx.fillStyle = "#00ff00";
		if( bt == 0){
	        ctx.fillRect(b.x,  b.y+(b.h/2)-10, b.w, 20);
		}else {
	        ctx.fillRect(b.x+(b.w/2)-10,  b.y, 20, b.h);
		}
        ctx.fillStyle = "#000000";

		if( b.snaps[1].paired != null){
			// draw input snap
			if( bt == 0){
				ctx.drawImage(bitpics[wirelinimg], b.snaps[0].x, b.snaps[0].y);
			}else {
				ctx.drawImage(bitpics[wiretinimg], b.snaps[0].x, b.snaps[0].y);
			}
		} 
		if( b.snaps[0].paired != null){
			// draw output snap
			if( bt == 0){
				ctx.drawImage(bitpics[wireroutimg], b.snaps[1].x, b.snaps[1].y);
			}else {
				ctx.drawImage(bitpics[wireboutimg], b.snaps[1].x, b.snaps[1].y);
			}
		} 
	}

// wire
	this.setBitSize = function(ax, ay)
	{	var l,r,t,b;
		var bit = this.bit;
		
		if( (bit.btype & 1) == 0){
			l = bit.snaps[0].x +15;
			r = bit.snaps[1].x;
			t = bit.y;
			b = bit.y+bit.h;

			bit.x = l;

			bit.w = r-l;
			bit.initw = bit.w;
			
			bit.setOrientation(0);
		}else {
			t = bit.snaps[0].y+15;
			b = bit.snaps[1].y;
			l = bit.x;
			r = bit.x+bit.w;

			bit.y = t;

			bit.h = b - t;
			bit.initw = bit.h
			bit.setOrientation(1);
		}
	}

// wire 
	this.HitTest = function(x, y)
	{	var res = null;

		return res;
	}


// wire 
	this.doSave = function()
	{	var msg = "1,";

		return msg;
	}
		
	this.doLoad = function(initdata,  idx)
	{	var i = initdata[idx];
	}		
		

}

//////////////////////////////////////////////////////////////////
//


function control(bit)
{	this.bit = bit;
	this.l = 0;
	this.r = 0;
	this.t = 0;
	this.b = 0;
	this.sx = 0;
	this.sy = 0;
	this.sval = 0;

	this.setBounds = function()
	{	var b = this.bit;
		var bt;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		if( bt == 0){
			this.l = b.x+10;
			this.r = b.x+b.initw-10;
			this.t = b.y+10;
			this.b = b.y+b.inith-10;
		}else {
			this.l = b.x+10;
			this.r = b.x+b.inith-10;
			this.t = b.y+10;
			this.b = b.y+b.initw-10;
		}
	}


	this.getDockedBit = function(s)
	{	var b = this.bit;
		var s, p;

		s = b.snaps[s];
		if( s == null){
			return null;
		}
		p = s.paired;
		if( p == null){
			return null;
		}

		return p.bit;
	}

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

		p = this.getDockedBit(0);

		if( p == null){
			xval = 0;
		}else {
			xval = p.data;
		}

		ctx.save();
		if( bt == 0){
	        ctx.drawImage(bitpics[ defaultimg ], b.x,  b.y);
		}else {
			ctx.translate( b.x, b.y+b.h);
			ctx.rotate(- Math.PI/2);
	        ctx.drawImage(bitpics[ defaultimg ], b.x,  b.y);
		}
		ctx.restore();
	}

	this.HitTest = function(x, y)
	{	var res = null;
		var i;
		var b = this.bit;
		var bt;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
		this.setBounds();
		
		if( x >= this.l && x <= this.r &&
		    y >= this.t && y <= this.b){
			res = this;
		}
		return res;
	}

// control.getdata
	this.getData = function()
	{
	}

	this.setData = function()
	{
	}


	this.onMove = function()
	{
	}


	this.startMove = function()
	{
	}

// control
	this.stopMove = function()
	{
//		var sketch=this.bit.parent;
		selected = this.bit;
		curctrl = null;			// stop tracking
	}

	this.doSave = function()
	{	var msg = "1,";

		return msg;
	}
		
//control
	this.doLoad = function(initdata, idx)
	{	var i = initdata[idx];
	}		
		

	this.delbit = function()
	{
	}

//control
	// when docked this is receiver
	this.dock = function(from, dom)
	{
	}

	this.dockto = function(from, dom)
	{
	}
//control
	// when undocked  this is the receiver
	this.undock = function(from)
	{
	}

	this.undockfrom = function(from, dom)
	{
	}

	this.setValue = function(data, chan)
	{

	}
	//control

	this.startProg = function()
	{
		debugmsg("Start Programming");
	}

	this.stopProg = function()
	{
		debugmsg("Stop Programming");
	}

	this.keyPress = function(code, up)
	{	let bit = this.bit;
		debugmsg("Keypress "+bit.name+" "+code+" "+up);
	}

}




