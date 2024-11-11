// midibit.js
// midi control bits


// note groups
var notegroup_list = new objlist();

// manage how notes are distributed

function notes()
{	this.start = null;
	this.stop = null;
	this.val = 0;
	this.stream = null;
}

function notegroup(name, poly)
{	this.name = name;
	this.poly = poly;
	this.count = 0;
	this.mode = 0;		// latest
	this.notes = null;
	let i;

	this.notes = new Array(poly);
	for(i=0; i < poly; i++){
		this.notes[i] = new notes();
	}

	// return true is note can be consumed.
	this.noteOn = function(note, stream)
	{	let i;
		let playing = this.poly;	// not playing

		i = 0;
		while(i < this.poly){
			if( this.notes[i].val == note){
				break;
			}
			if( this.notes[i].stream == stream){
				playing = i;
			}
			i++;
		}
		if( i == this.poly){
			// not found

		}
		debugmsg("NoteOn '"+this.name+"' "+note);
		return true;
	}

	this.noteOff = function(note, stream)
	{
		debugmsg("NoteOff '"+this.name+"' "+note);
		return true;
	}
}

function findNoteGroup( group, ng, poly)
{	// find group in list, add uniq
	let ret = null;

	if( ng == null){
		ret = notegroup_list.adduniq( group, null);
		if( ret.data == null){
			ret.data = new notegroup( group, poly);
			return ret.data;
		}
	}else if( ng.name == group){
		return ng;
	}else {
		ret = notegroup_list.adduniq( group, null);
		if( ret.data == null){
			ret.data = new notegroup( group, poly);
			return ret.data;
		}
		debugmsg("changed notegroup '"+group+"' '"+ng.name+"'");
	}
	return null;
}



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
	return useMIDIout;
}



function isSelected(a, b)
{
    if( a == b){
        return "selected";
    }
    return "";
}

function MidiChannelSelector(chan, omni)
{   let sel=""+chan;
    let i = 1;
    let msg = "<select id='midichannel' >";
	if( omni){
        msg+= "<option value='0' "+isSelected("0", sel)+" >OMNI</option>";
	}
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
	this.prevgroup = new delta();
	this.midi = 0;
	this.prevmidi = new delta();
	this.notegroup = null;
	this.poly = 4;
	this.note = 0;

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
			msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel, true)+"</td></tr>\n";
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
			val = f.value;
			if( this.prevgroup.changed( val)){
				this.group = val;
				this.notegroup = findNoteGroup( this.group, this.notegroup, this.poly);
				debugmsg("CV group "+this.group);
			}
		}

	}

	this.onRemove = function()
	{
		let x = midicv_list.adduniq( this, null);
		x.ob = null;		// blank our reference
		midicv_list.removeobj(x);
	}

	// midicv
	this.filter = function(op, chan, arg2)
	{	let b = this.bit;
		let note = arg2+arg2;

		// if not OMNI and not this channel
		if( this.channel != 0 && this.channel != chan){
			return false;
		}
		if( op == 1){
//			this.notegroup = findNoteGroup( this.group, this.notegroup, this.poly);
//			if( this.notegroup.noteOn( note, this)){
			if( this.note == 0){		// if not playing a note.
				b.value = note;
				this.note = note;
				return true;
			}
		}else if( op == 0 ){	// note off
			if( note == this.note){
				b.value = 0;
				this.note = 0;
				return true;
			}
		}
		return false;
	}

	// finish init.
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
			msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel, true)+"</td></tr>\n";
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

	this.filter = function(name, chan, arg2)
	{
		// if not OMNI and not this channel
		if( this.chan != 0 || this.chan != chan){
			debugmsg("CV filter "+name+" "+chan+" mismatch");
			return false;
		}
		debugmsg("CC filter "+name+" "+chan+" "+arg2);
		return true;
	}

	midicc_list.adduniq( this, null);
}


midiCVOutBit.prototype = Object.create(control.prototype);

function midiCVOutBit(bit)
{	control.call(this, bit);
	this.bit = bit;
    this.channel = 1;   
    this.group = "";
	this.prevgroup = new delta();
	this.midi = 0;
	this.prevmidi = new delta();
	this.notegroup = null;
	this.note = 0;
	this.outdev = null;

    let imagename = "midicc";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

    // Midi note out bit self draw
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

	// function sendMiddleC(midiAccess, portID) {
  	// const noteOnMessage = [0x90, 60, 0x7f]; // note on middle C, full velocity
  	//const output = midiAccess.outputs.get(portID);
  	//output.send(noteOnMessage); //omitting the timestamp means send immediately.
  	//output.send([0x80, 60, 0x40], window.performance.now() + 1000.0); // timestamp = now + 1000ms.
	//}
	this.setValue = function(data, chan)
	{	let msg = [ 0x90, 60, 127];
		let note = Math.floor(data/ 2);
		let mid = null;
		let send=null;
		let output = null;
		let chanx = this.channel-1;

		if( chan != 0){
			return;
		}

		if( data < 16){
			note = 0;		// muted
		}
		if( this.outdev == null){
			return;
		}

		mid = this.outdev.midi.value.id;
		output = midiAccess.outputs.get(mid);

		if( this.note != note){
			if( this.note >= 16 || note == 0){
				// send off
				msg[0] = 0x80 | (chanx & 0xf);
				msg[1] = this.note & 0x7f;
				msg[2] = 64;
				output.send(msg);	// send note off
//				debugmsg("CVOUT off "+this.note+" "+this.channel);
			}
			this.note = 0;

			if( data < 16){
				return;		// note off done.
			}

			msg[0] = 0x90 | (chanx & 0xf);
			msg[1] = note & 0x7f;
			msg[2] = 127;
			this.note = note;
			output.send(msg);
//			debugmsg("CVOUT on "+this.note+" "+this.channel);
	
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
			msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(0, this.midi)+"</td></tr>\n";
			msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel, false)+"</td></tr>\n";
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

		f = document.getElementById("midioutsel");
		if( f != null){
			val = f.value;
			this.midi = val;
			if( this.prevmidi.changed(val)){
				this.outdev = selMIDIoutdev(val);
			}
		}
		f = document.getElementById("midichannel");
		if( f != null){
			val = f.value;
			this.channel = val;
		}

	}



}

midiCCOutBit.prototype = Object.create(control.prototype);

function midiCCOutBit(bit)
{	control.call(this, bit);
	this.bit = bit;
    this.channel = 0;   // OMNI
    this.group = "";
	this.prevgroup = new delta();
	this.midi = 0;
	this.prevmidi = new delta();
	this.notegroup = null;
	this.note = 0;

    let imagename = "midicv";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

    // Midi note out bit self draw
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

//ccout
    this.setData = function()
	{	let msg="";
		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(0, this.midi)+"</td></tr>\n";
			msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel, false)+"</td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

	//ccout
	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;

		f = document.getElementById("midioutsel");
		if( f != null){
			val = f.value;
			this.midi = val;
			if( this.prevmidi.changed(val)){
				selMIDIoutdev(val);
			}
		}
		f = document.getElementById("midichannel");
		if( f != null){
			val = f.value;
			this.channel = val;
		}

	}


}

