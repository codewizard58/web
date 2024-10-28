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

