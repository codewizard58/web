// bar graph stereo
barGraph2Bit.prototype = Object.create(control.prototype);

function barGraph2Bit(bit)
{	control.call(this, bit);
	this.bit = bit;

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
		var xval, xval2;
		var p;
		var xtmp, xtmp2;
		var tmp;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		xval = b.data;

		p = this.getDockedBit(2);

		if( p == null){
			xval2 = 0;
		}else {
			xval2 = softprogram.chains[p.chain].data;
		}

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			xval = Math.floor( (xval * (b.w))/ 255);
			xval2 = Math.floor( (xval2 * (b.w))/ 255);
	        ctx.fillRect(b.x,  b.y+(b.h/2)-12, b.w, 24);
	        ctx.fillStyle = "#00ff00";
			xtmp = xval;
			xtmp2 = xval2;
	        ctx.fillRect(b.x,  b.y+(b.h/2)-11, xtmp, 10);
	        ctx.fillRect(b.x,  b.y+(b.h/2)+1, xtmp2, 10);
		}else {
			xval = Math.floor( (xval * (b.h))/ 255);
			xval2 = Math.floor( (xval2 * (b.h))/ 255);
	        ctx.fillRect(b.x+(b.w/2)-12, b.y, 24, b.h);
	        ctx.fillStyle = "#00ff00";
			xtmp = xval;
			xtmp2 = xval2;
	        ctx.fillRect(b.x+(b.w/2)-11, b.y+b.h-xtmp, 10, xtmp);	// 255 at top..
	        ctx.fillRect(b.x+(b.w/2)+1, b.y+b.h-xtmp2, 10, xtmp2);	// 255 at top..
		}
        ctx.fillStyle = "#000000";
	}

	this.HitTest = function(x, y)
	{	var res = null;

		return res;
	}


}

