///////////////////////////////////////////////////////////////////////////////////
////////////  Piano control
///////////////////////////////////////////////////////////////////////////////////


var pianomap = [
	48, 81, 5, 55,		// Q
	49, 50, 15, 0,		// 2
	50, 87, 25, 55,	// W
	51, 51, 35, 0,		// 3
	52, 69, 45, 55,	// E
	53, 82, 65, 55,	// R
	54, 53, 75, 0,		// 5
	55, 84, 85, 55,	// T
	56, 54, 95, 0,		// 6
	57, 89, 105, 55,	// Y
	58, 55, 115, 0,		// 7
	59, 85, 125, 55,	// U
	60, 73, 145, 55,	// I
	61, 57, 155, 0,	// 9
	62, 79, 165, 55,	// O
	63, 48, 175, 0,	// 0
	64, 80, 185, 55,	// P

	0, 0, 0, 0
];

pianoBit.prototype = Object.create(control.prototype);

function pianoBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.l = 0;
	this.r = 0;
	this.t = 0;
	this.b = 0;
	this.sx = 0;
	this.sy = 0;
	this.sval = 0;
    let imagename = "piano";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Piano";

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
		var i;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		ctx.save();
		ctx.translate( b.x, b.y);
		if( bt != 0){
			ctx.translate( 0, b.h);
			ctx.rotate(- Math.PI/2);
		}
        ctx.drawImage(bitpics[ this.bitimg ], 0, 0);

		if( b.value >= 48 && b.value <= 64){
	        ctx.fillStyle = "#0000ff";
			i = (b.value - 48) * 4;
	        ctx.fillRect( pianomap[ i+2] ,  pianomap[i+3], 10, 30);
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
		return res;	}

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

	this.KeyPress = function( code, up)
	{	var i;
		var b = this.bit;

		if( b.chain == 0){
			message("Piano not powered");
			return;
		}

		for(i=0; pianomap[i] != 0 ; i += 4){
			if( pianomap[i+1] == code){
				b.value = pianomap[i];
				if( up == 0){
					b.value = 0;
				}
				return;
			}
		}
		message("KeyPress "+code+" "+up);
	}

	this.doSave = function()
	{	var msg = "1,";

		return msg;
	}

// piano.doLoad()
	this.doLoad = function(initdata,  idx)
	{	var i = initdata[idx];
	}		
		
}

