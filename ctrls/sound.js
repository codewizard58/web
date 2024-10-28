/// sound bits
oscBit.prototype = Object.create(control.prototype);

function oscBit(bit)
{	control.call(this, bit);

    let imagename = "osc";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval = b.value;		// 0 - 255
        let osc = this.bitimg;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
//		message("Draw slider "+ xval);

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ osc ], b.x, b.y-5);
		}else {
			ctx.drawImage(bitpics[ osc+1 ], b.x, b.y);
		}
	}


}


/// sound bits
speakerBit.prototype = Object.create(control.prototype);

function speakerBit(bit)
{	control.call(this, bit);

    let imagename = "speaker";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval = b.value;		// 0 - 255
        let speaker = this.bitimg;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
//		message("Draw slider "+ xval);

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ speaker ], b.x, b.y);
		}else {
			ctx.drawImage(bitpics[ speaker+1 ], b.x, b.y);
		}
	}


}



