// outputCCBit
function outputCCBit(bit)
{	this.bit = bit;
	this.l = 0;
	this.r = 0;
	this.t = 0;
	this.b = 0;
	this.sx = 0;
	this.sy = 0;
	this.sval = 0;

// outputCCBit
this.setBounds = function()
	{	var b = this.bit;
		var bt;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		if( bt == 0){
			this.l = b.x+10;
			this.r = b.x+b.w-10;
			this.t = b.y+10;
			this.b = b.y+b.h-10;
		}else {
			this.l = b.x+10;
			this.r = b.x+b.w-10;
			this.t = b.y+10;
			this.b = b.y+b.h-10;
		}
	}


// outputCCBit
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

// outputCCBit
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

		if( bt == 0){
	        ctx.drawImage(bitpics[ defaultimg ], b.x, b.y);
		}else {
			ctx.save();
			ctx.translate( b.x, b.y+b.h);
			ctx.rotate(- Math.PI/2);
	        ctx.drawImage(bitpics[ defaultimg ], 0, 0);
			ctx.restore();
		}
	}

// outputCCBit
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


// outputCCBit
	this.stopMove = function()
	{
	}

	this.doSave = function()
	{	var msg = "1,";

		return msg;
	}
		
	this.doLoad = function(initdata, idx)
	{	var i = initdata[idx];
	}		
		
}

function outputNoteBit(bit)
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
			this.r = b.x+b.w-10;
			this.t = b.y+10;
			this.b = b.y+b.h-10;
		}else {
			this.l = b.x+10;
			this.r = b.x+b.w-10;
			this.t = b.y+10;
			this.b = b.y+b.h-10;
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

		if( bt == 0){
	        ctx.drawImage(bitpics[ "default" ], b.x, b.y);
		}else {
			ctx.save();
			ctx.translate( b.x, b.y+b.h);
			ctx.rotate(- Math.PI/2);
	        ctx.drawImage(bitpics[ "default" ], 0, 0);
			ctx.restore();
		}
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


	this.stopMove = function()
	{
	}

	this.doSave = function()
	{	var msg = "1,";

		return msg;
	}
		
	this.doLoad = function(initdata,  idx)
	{	var i = initdata[idx];
	}		
		
}
