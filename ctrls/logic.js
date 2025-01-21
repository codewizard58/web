///////////////////////////////////////////////////////////
andBit.prototype = Object.create(control.prototype);

function andBit(bit)
{	control.call(this, bit);

    let imagename = "and2";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "And";

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
		let bt;
        let and = this.bitimg;
		let xval = 0;

		if( b == null){
			return;
		}
		xval = this.nfreq;		// 0 - 255
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			xval = xval;
			drawImage( and , b.x, b.y);
		}else {
			drawImage( and+1 , b.x, b.y);
		}
	}

}



orBit.prototype = Object.create(control.prototype);

function orBit(bit)
{	control.call(this, bit);

    let imagename = "and2";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Or";

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
		let bt;
        let and = this.bitimg;
		let xval = 0;

		if( b == null){
			return;
		}
		xval = this.nfreq;		// 0 - 255
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			xval = xval;
			drawImage( and , b.x, b.y);
		}else {
			drawImage( and+1 , b.x, b.y);
		}
	}

}


