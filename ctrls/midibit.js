// midibit.js
// midi control bits

var midicv_list = new objlist();
var midicc_list = new objlist();


function selMIDIindev(dev)
{	var l = MIDIindev_list.head;

	if( useMIDIin != null){
		useMIDIin.midi.value.onmidimessage = noMIDIMessageEventHandler;
	}

	useMIDIin = null;
	while(dev != 0 && l != null){
		if( l.ob.count == dev){
			useMIDIin = l.ob;
			if( dev == 1){
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler1;
			}else if( dev == 2){
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler2;
			}else if( dev == 3){
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler3;
			}else if( dev == 4){
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler4;
			}
			l = null;
		}else {
			l = l.next;
		}
	}

}


//////////////////////////////////////////////////////////////////////////////

function selMIDIoutdev(dev)
{
	var l = MIDIoutdev_list.head;

	useMIDIout = null;
	while(dev != 0 && l != null){
		if( l.ob.count == dev){
			useMIDIout = l.ob;
			l = null;
		}else {
			l = l.next;
		}
	}

}
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
	this.midi = 0;
	this.prevmidi = new delta();

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

// midi CV (notes)
    this.setData = function()
	{	let msg="";
		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(1, this.midi)+"</td></tr>\n";
			msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel)+"</td></tr>\n";
			msg += "<tr><th align='right'>Group</th><td ><input id='group' value='"+this.group+"' size='4' /></td></tr>\n";
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

		f = document.getElementById("midiinsel");
		if( f != null){
			val = f.value;
			this.midi = val;
			if( this.prevmidi.changed(val)){
				selMIDIindev(val);
			}
		}
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

	this.onRemove = function()
	{
		let x = midicv_list.adduniq( this, null);
		x.ob = null;		// blank our reference
		midicv_list.removeobj(x);
	}

	// midicv
	this.filter = function(name, arg1, arg2)
	{
		debugmsg("CV filter "+name+" "+arg1+" "+arg2);
	}
	midicv_list.adduniq( this, null);

}


// cv and cc images swapped.
midiCCBit.prototype = Object.create(control.prototype);

function midiCCBit(bit)
{	control.call(this, bit);
	this.bit = bit;

    let imagename = "midicv";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
    this.channel = 0;   // OMNI
    this.group = "";
	this.midi = 0;		// midi interface input
	this.prevmidi = new delta();
	this.cc = 0;


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

    this.setData = function()
	{	let msg="";
		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(1, this.midi)+"</td></tr>\n";
			msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel)+"</td></tr>\n";
			msg += "<tr><th align='right'>Group</th><td ><input id='group' value='"+this.group+"' size='4' /></td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

	// midicc
	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;

		f = document.getElementById("midiinsel");
		if( f != null){
			val = f.value;
			this.midi = val;
			if( this.prevmidi.changed(val)){
				selMIDIindev(val);
			}
		}
		f = document.getElementById("midichannel");
		if( f != null){
			val = f.value;
			this.channel = val;
		}
		f = document.getElementById("group");
		if( f != null){
			this.group = f.value;
			debugmsg("CC group "+this.group);
		}
		f = document.getElementById("control");
		if( f != null){
			this.cc = f.value;
			debugmsg("CC control "+this.group);
		}

	}

	this.onRemove = function()
	{
		let x = midicc_list.adduniq( this, null);
		x.ob = null;		// blank our reference
		midicc_list.removeobj(x);
	}

	this.filter = function(name, arg1, arg2)
	{
		debugmsg("CC filter "+name+" "+arg1+" "+arg2);
	}

	midicc_list.adduniq( this, null);
}


