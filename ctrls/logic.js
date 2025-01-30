///////////////////////////////////////////////////////////
logicBit.prototype = Object.create(control.prototype);

function logicBit(bit)
{	control.call(this, bit);

	this.setImage = function(imagename, name, code){
		this.bitimg =this.bit.findImage(imagename);
		this.bitname = imagename;
		this.name = name;
		this.bit.code = code;
	}

    this.setOrientation = function(bt)
	{   const b = this.bit;

		if( bt == 0){
			b.coords = [ -15, 10, b.w, 50,  -15, 90, 0, 0 ];
			b.suffix = [ "-l", "-r", "-l", "-b" ];
		}else {
			b.coords = [ 10, -15, 50, b.h, 90, -15, 0, 0 ];
			b.suffix = [ "-t", "-b", "-t", "-r" ];
		}

        b.setSnaps();
		return true;
	}

	this.Draw = function( )
	{	const b = this.bit;
        let img = this.bitimg;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage( img , b.x, b.y);
		}else {
			drawImage( img+1 , b.x, b.y);
		}
	}

}



