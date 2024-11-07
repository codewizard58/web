// midibit.js
// midi control bits

function isSelected(a, b)
{
    if( a == b){
        return "selected";
    }
    return "";
}

function MidiChannelSelector(chan)
{   let sel=""+chan;
    let i = 1;
    let msg = "<select id='midichannel' >";
        msg+= "<option value='0' "+isSelected("0", sel)+" >OMNI</option>";
        for(i=1; i < 17; i++){
            msg+= "<option value='"+i+"' "+isSelected(""+i, sel)+" >"+i+"</option>";
        }
        msg += "</select>\n";

    return msg;
}

midiInBit.prototype = Object.create(control.prototype);

function midiInBit(bit)
{	control.call(this, bit);
	this.bit = bit;

    let imagename = "midiin";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

    // Midi input processor self draw, should show midi activity?
	this.Draw = function( )
	{	var b = this.bit;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ this.bitimg ], b.x, b.y);
		}else {
			ctx.drawImage(bitpics[ this.bitimg+1 ], b.x, b.y);
		}
	}


}


// cv and cc images swapped.
midiCVBit.prototype = Object.create(control.prototype);

function midiCVBit(bit)
{	control.call(this, bit);
	this.bit = bit;
    this.channel = 0;   // OMNI
    this.group = "";

    let imagename = "midicc";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

    // Midi note bit self draw
	this.Draw = function( )
	{	var b = this.bit;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ this.bitimg ], b.x, b.y);
		}else {
			ctx.drawImage(bitpics[ this.bitimg+1 ], b.x, b.y);
		}
	}




    this.setData = function()
	{	let msg="";
		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel)+"</td></tr>\n";
			msg += "<tr><th align='right'>Group</th><td ><input id='group' value='' size='4' /></td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;

		f = document.getElementById("midichannel");
		if( f != null){
			val = f.value;
			this.channel = val;
		}
		f = document.getElementById("group");
		if( f != null){
			this.group = f.value;
			debugmsg("CV group "+this.group);
		}

	}


}


// cv and cc images swapped.
midiCCBit.prototype = Object.create(control.prototype);

function midiCCBit(bit)
{	control.call(this, bit);
	this.bit = bit;

    let imagename = "midicv";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;


    // Midi control code bit self draw
	this.Draw = function( )
	{	var b = this.bit;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ this.bitimg ], b.x, b.y);
		}else {
			ctx.drawImage(bitpics[ this.bitimg+1 ], b.x, b.y);
		}
	}

}




