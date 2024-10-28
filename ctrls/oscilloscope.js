//////////////////////////////////////////////////////////////////////
// oscilloscope
//

function graphBit(bit)
{	this.bit = bit;
	this.hdata = new Array(180);
	this.hdata2= null;
	this.speed=1;
	this.curpos=0;
	var i;

	for(i=0; i < 180; i++){
		this.hdata[i] = 0;
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

// graph
	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval, xval2;
		var p;
		var xtmp, xtmp2;
		var tmp;
		var i, j, h;
		var prev;

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

        ctx.fillStyle = "#000000";	// background
        ctx.fillRect(b.x+10,  b.y+10, b.w-20, b.h-20);

        ctx.fillStyle = "#00cc00";	// graticule
		for(i=0; i < b.w-20;i+= 10){
	        ctx.fillRect(b.x+20+i,  b.y+10, 1, b.h-20);
		}
		for(i=0; i < b.h-20;i+= 10){
	        ctx.fillRect(b.x+10,  b.y+20+i, b.w-20, 1);
		}

        ctx.fillStyle = "#ffffff";
		j = this.curpos;
		xtmp2 = 80;

		if( p == null && this.hdata2 != null){
			this.hdata2 = null;
		}

		if( this.hdata2 != null){
	        ctx.fillStyle = "#ff0000";
			xtmp = this.hdata2[j];
			tmp	= Math.floor((xtmp * xtmp2) / 256);
			prev = tmp;
			for(i=0; i < 180; i++){
				xtmp = this.hdata2[j];
				tmp	= Math.floor((xtmp * xtmp2) / 256);
				if( tmp > prev){
					h = tmp - prev;
					ctx.fillRect(b.x+b.w-10-i, b.y+b.h-12-tmp, 2, 2+h);
				}else {
					h = prev - tmp;
					ctx.fillRect(b.x+b.w-10-i, b.y+b.h-12-tmp-h, 2, 2+h);
				}

				prev = tmp;
				j--;
				if( j < 0){
					j = 179;
				}
			}
	        ctx.fillStyle = "#ffffff";
		}

		xtmp = this.hdata[j];
		tmp	= Math.floor((xtmp * xtmp2) / 256);
		prev = tmp;
		for(i=0; i < 180; i++){
			xtmp = this.hdata[j];
			tmp	= Math.floor((xtmp * xtmp2) / 256);
			if( tmp > prev){
				h = tmp - prev;
				ctx.fillRect(b.x+b.w-10-i, b.y+b.h-12-tmp, 2, 2+h);
			}else {
				h = prev - tmp;
				ctx.fillRect(b.x+b.w-10-i, b.y+b.h-12-tmp-h, 2, 2+h);
			}

			prev = tmp;
			j--;
			if( j < 0){
				j = 179;
			}
		}

        ctx.fillStyle = "#000000";
	}

	this.setValue = function(data, chan)
	{
		if( chan == 0){
			this.curpos++;
			if( this.curpos >= 180){
				this.curpos = 0;
			}
			this.hdata[this.curpos] = data;
		}else {
			if( this.hdata2 == null){
				this.hdata2 = new Array(180);
				for(i=0; i< 180;i++){
					this.hdata2[i] = 0;
				}
			}
			this.hdata2[this.curpos] = data;
		}

	}

	this.HitTest = function(x, y)
	{	var res = null;

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

