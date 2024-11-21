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

function UIeditname()
{	let f;

	bitform = document.getElementById("bitform");
	if( bitform == null){
		return;
	}
	f = document.getElementById("groupedit");
	if( f != null){
		f.innerHTML = "<input type='text' id='newname' value='New name' />\n";
	}

}


var midicv_list = new objlist();
var midicc_list = new objlist();
var midiclk_list = new objlist();

// used by learn function.
var midicvout_list = new objlist();
var midiccout_list = new objlist();


function selMIDIindev(dev)
{	var l = MIDIindev_list.head;	// list of interfaces

	if( useMIDIin != null){
		useMIDIin.midi.value.onmidimessage = noMIDIMessageEventHandler;
	}

	useMIDIin = null;
	while(dev != 0 && l != null){
		if( l.ob.count == dev){
			useMIDIin = l.ob;
			if( dev == 1){
				MIDIindev[dev] = useMIDIin;
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler1;
			}else if( dev == 2){
				MIDIindev[dev] = useMIDIin;
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler2;
			}else if( dev == 3){
				MIDIindev[dev] = useMIDIin;
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler3;
			}else if( dev == 4){
				MIDIindev[dev] = useMIDIin;
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
			return useMIDIout;
		}
		l = l.next;
	}
	return null;
}



function isSelected(a, b)
{
    if( a == b){
        return "selected";
    }
    return "";
}

function MidiChannelSelector(chan, omni)
{   let sel=chan;
    let i = 1;
    let msg = "<select id='midichannel' >";
	if( omni){
        msg+= "<option value='0' "+isSelected(0, sel)+" >OMNI</option>";
	}
        for(i=1; i < 17; i++){
            msg+= "<option value='"+i+"' "+isSelected(i, sel)+" >"+i+"</option>";
        }
        msg += "</select>\n";

    return msg;
}

var cc_code_tab = [
  0, "Bank Select", 1,
  1, "Modulation Wheel", 0,
  2, "Breath controller", 0,
  4, "Foot Pedal", 1,
  5, "Portamento Time", 1,
  6, "Data Entry", 1,
  7, "Volume", 1,
  8, "Balance", 1,
 10, "Pan position", 1,
 11, "Expression", 0,
 12, "Effect Control 1", 1,
 13, "Effect Control 2", 1,
 16, "Ribbon Controller or General Purpose Slider 1", 0,
 17, "Knob 1 or General Purpose Slider 2", 0,
 18, "General Purpose Slider 3", 0,
 19, "Knob 2 General Purpose Slider 4", 0,
 20, "Knob 3 or Undefined", 0,
 21, "Knob 4 or Undefined", 0,
 64, "Hold Pedal (on/off)", 0,
 65, "Portamento (on/off)", 0,
 66, "Sostenuto Pedal (on/off)", 0,
 67, "Soft Pedal (on/off)", 0,
 68, "Legato Pedal (on/off)", 0,
 69, "Hold 2 Pedal (on/off)", 0,
 70, "Sound Variation", 0,
 71, "Resonance (Timbre)", 0,
 72, "Sound Release Time", 0,
 74, "Frequency Cutoff (Brightness)", 0,
 75, "Sound Control 6", 0,
 76, "Sound Control 7", 0,
 77, "Sound Control 8", 0,
 78, "Sound Control 9", 0,
 79, "Sound Control 10", 0,
 80, "Decay", 0,
 81, "Hi Pass Filter Frequency", 0,
 82, "General Purpose Button 3", 0,
 83, "General Purpose Button 4", 0,
 84, "Portamento Amount", 0
];


//////////////////////////////////////////////////////////////////////////////////////
function showMidiControlCodes(cc)
{
	let msg = "";
	let n = 0;
	let ccx = 0;
	let selcnt = 0;

	msg += "<select id='control' >\n";
	msg += "<option value=''></option>\n";
	for(n=0; n < cc_code_tab.length; n += 3){
		ccx = (cc_code_tab[n]);
		if( cc == ccx){
			selcnt++;
		}
		msg += "<option value='"+ccx+"' "+isSelected(cc, ccx)+" >"+ccx+" - "+(cc_code_tab[n+1])+"</option>\n";
	}
	msg += "</select>\n";
	if( selcnt == 0){
		msg += "<br /><input type='text' value='"+cc+"' id='usercontrol' size='4' /> ";
	}else {
		msg += "<br /><input type='text' value='' id='usercontrol' size='4' /> ";
	}
	return msg;
}

// cv and cc images swapped.
midiCVBit.prototype = Object.create(control.prototype);

function midiCVBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.poly = 4;
	this.note = 0;
	this.groupobj = findGroupDefault(1);

    let imagename = "midicv";
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
		const grp =  this.groupobj;

		if( bitform != null){
			bitform.innerHTML="";
		}
		midilearning = false;	// clear learning mode

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(1,grp.name, false)+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_in</td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

// midi CV (notes)
	this.getData = function()
	{	let f = null;
		let val = 0;

		f = document.getElementById("groupname");
		if( f != null){
			this.groupobj = getMidiGroup(f.value);
			debugmsg("CV "+this.groupobj.name+" "+this.groupobj.channel);
		}
	}

	this.onRemove = function()
	{
		let x = midicv_list.adduniq( this, null);
		x.ob = null;		// blank our reference
		midicv_list.removeobj(x);
	}

	// midicv
	this.filter = function(op, chan, arg2, arg3, dev)
	{	let b = this.bit;
		let note = arg2+arg2;
		let channel = this.groupobj.channel;

		debugmsg("CV filter "+op+" "+chan+" "+arg2+" "+arg3+" "+dev);

		// if not OMNI and not this channel
		if( channel != 0 && channel != chan){
			return false;
		}
		if( op == 1){
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

    let imagename = "midicc";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.cc = 0;
	this.data = 0;
	this.groupobj = findGroupDefault(1);


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

	// midicc
    this.setData = function()
	{	let msg="";
		const grp = this.groupobj;

		if( bitform != null){
			bitform.innerHTML="";
		}
		midilearning = false;	// clear learning mode

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(1, grp.name, false)+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_in</td></tr>\n";
			msg += "<tr><th>Control Code</th><td>"+showMidiControlCodes(this.cc);
			msg += "<input type='button' value='Learn' id='learn' onclick='UIlearn(0, "+grp.grouptype+");'";
			msg += "/></td></tr>";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

	// midicc
	this.getData = function()
	{	let f = null;
		let val = 0;

		f = document.getElementById("groupname");
		if( f != null){
			this.groupobj = getMidiGroup(f.value);
			debugmsg("CC "+this.groupobj.name+" "+this.groupobj.channel);
		}

		f = document.getElementById("control");
		if( f != null){
			this.cc = f.value;
			debugmsg("CC control "+this.cc);
		}
		f = document.getElementById("usercontrol");
		if( f != null){
			if( f.value != ""){
				this.cc = f.value;
				debugmsg("CC USER control "+this.cc);
			}
		}

	}

	this.onRemove = function()
	{
		let x = midicc_list.adduniq( this, null);
		x.ob = null;		// blank our reference
		midicc_list.removeobj(x);
	}

	// midi cc
	this.filter = function(op, chan, arg2, arg3, dev)
	{	const b = this.bit;
		const channel = this.groupobj.channel;

		if( op == 2){
			// if not OMNI and not this channel
			if( channel != 0 && channel != chan){
				return false;
			}
			if( midilearning && bitformaction == this){
				return learn(this, op, chan, arg2, arg3);
			}
			if( this.cc != arg2){
				// code mismatch
				return false;
			}
			// *2   range 0,2 - 255;
			this.data = arg3+arg3;
			if( arg3 > 0){
				this.data++;
			}
			b.value = this.data;
		}
		return true;
	}

	midicc_list.adduniq( this, null);
}


midiCVOutBit.prototype = Object.create(control.prototype);

function midiCVOutBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.note = 0;
	this.groupobj = findGroupDefault(0);
	this.mute = false;
	this.mod = 0;
	this.offset = 128;		// 128 biased.
	this.gain = 128;

    let imagename = "midicv";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = "midicvout";

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
		if( this.mute){
			ctx.fillStyle = "#ff0000";
			ctx.fillRect(b.x+b.w-10,  b.y, 10, 10);
			ctx.fillStyle = "#ffffff";
		}
	}

// midi cv output ( note on/off)
	this.setValue = function(data, chan)
	{	let msg = [ 0x90, 60, 127];
		let note = Math.floor(data/ 2);
		let mid = null;
		let send=null;
		let output = null;
		const grp = this.groupobj;
		let chanx = grp.channel-1;

		if( chan == 1){
			if( this.mod == 0){
				this.offset = data;
			}else if(this.mod == 1){
				this.gain = data;
			}else if(this.mod ==2){
				if( data > 128){
					this.mute = true;
				}else {
					this.mute = false;
				}
			}
			return;
		}

		if( chan != 0){
			return;
		}

		if( data < 16){
			note = 0;		// muted
		}
		if( grp.outdev == null){
			debugmsg("OUTDEV null "+grp.name+" type"+grp.grouptype);
			return;
		}

		mid = grp.outdev.midi.value.id;
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
			if( !this.mute){
				output.send(msg);
			}else {
				debugmsg("CVOUT muted "+this.note+" "+this.channel);
			}
	
		}

	}

	this.modnames = [ "offset", "gain", "mute"]

// midi cv output ( note on/off)
	this.setData = function()
	{	let msg="";
		const grp = this.groupobj;

		if( bitform != null){
			bitform.innerHTML="";
		}
		midilearning = false;	// clear learning mode

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(0, grp.name, false)+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_out</td></tr>\n";
			msg += "<tr><th align='right'>Modulation</th><td >"+showModulation(this.mod, this.modnames)+"</td></tr>\n";
			msg += "<tr><th>Offset</th><td><input type='text' id='offset' value='"+this.offset+"' /></td></tr>\n";
			msg += "<tr><th>Gain</th><td><input type='text' id='gain' value='"+this.gain+"' /></td></tr>\n";
			msg += "<tr><th>Mute</th><td>"+showMute(this.mute)+"</td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	}

// midi cv output ( note on/off)
	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;
		let g = null;

	
		f = document.getElementById("groupname");
		if( f != null){
			if( f.value > 0){
				this.groupobj = getMidiGroup(f.value);
			}
		}

		f = document.getElementById("mod");
		if( f != null){
			this.mod = f.value;		// modulation routing
		}
		f = document.getElementById("offset");
		if( f != null){
			this.offset = f.value;		// modulation routing
		}
		f = document.getElementById("gain");
		if( f != null){
			this.gain = f.value;		// modulation routing
		}
	}

	// midi cv out used by learn.
	this.filter = function(op, chan, arg2, arg3, dev)
	{	const b = this.bit;
		const channel = this.groupobj.channel;

		if( op == 2){
			// if not OMNI and not this channel
			if( channel != 0 && channel != chan){
				return false;
			}
			if( midilearning && bitformaction == this){
				return learn(this, op, chan, arg2, arg3);
			}
		}
		return true;
	}
	
	// finish init.
	midicvout_list.adduniq( this, null);

}

midiCCOutBit.prototype = Object.create(control.prototype);

function midiCCOutBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.cc = 0;
	this.groupobj = findGroupDefault(0);
	this.mute = false;
	this.mod = 0;
	this.offset = 128;	// 128 bias
	this.gain = 0;		// 255 - mod depth.

    let imagename = "midicc";		
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = "midiccout";

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
		if( this.mute){
			ctx.fillStyle = "#ff0000";
			ctx.fillRect(b.x+b.w-10,  b.y, 10, 10);
			ctx.fillStyle = "#ffffff";
		}
	}

	//ccout
	// midi cc output 
	this.setValue = function(data, chan)
	{	let msg = [ 0xb0, 60, 127];
		let note = Math.floor(data/ 2);
		let mid = null;
		let send=null;
		let output = null;
		const grp = this.groupobj;
		let chanx = grp.channel-1;

		if( chan == 1){
			if(this.mod == 0){			// see this.modnames
				this.offset = data;
			}else if( this.mod == 1){
				if( data > 128){
					this.mute = true;
				}else {
					this.mute = false;
				}
			}
			return;
		}

		if( chan != 0){		// use input snap 0 only
			return;
		}

		if( grp.outdev == null){
			return;
		}

		mid = grp.outdev.midi.value.id;
		output = midiAccess.outputs.get(mid);

		note += (this.offset - 128) / 16;

		if( note < 0){		// clamp
			note = 0;
		}else if( note > 127){
			note = 127;
		}

		msg[0] = 0xb0 | (chanx & 0xf);
		msg[1] = this.cc & 0x7f;
		msg[2] = note & 0x7f;

		if( !this.mute ){
			output.send(msg);
		}
	}


	this.modnames = [ "offset", "mute"];
	//ccout
	// midi cc output 
	this.setData = function()
	{	let msg="";
		const grp = this.groupobj;

		if( bitform != null){
			bitform.innerHTML="";
		}
		midilearning = false;	// clear learning mode

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(0, grp.name, false)+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_out</td></tr>\n";
			msg += "<tr><th>Control Code</th><td>"+showMidiControlCodes(this.cc);
			msg += "<input type='button' value='Learn' id='learn' onclick='UIlearn(0, "+grp.grouptype+");'";
			msg += "</td></tr>";
			msg += "<tr><th align='right'>Modulation</th><td >"+showModulation(this.mod, this.modnames)+"</td></tr>\n";
			msg += "<tr><th>Offset</th><td><input type='text' id='offset' value='"+this.offset+"' /></td></tr>\n";
			msg += "<tr><th>Mute</th><td>"+showMute(this.mute)+"</td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}

	}

	//ccout
	// midi cc output 
	this.getData = function()
	{	let f = null;
		let val = 0;
		let g = null;

		f = document.getElementById("groupname");
		if( f != null){
			if( f.value > 0){
				this.groupobj = getMidiGroup(f.value);
				debugmsg("CC Out "+this.groupobj.name+" "+this.groupobj.channel);
			}
		}
		f = document.getElementById("control");
		if( f != null){
			this.cc = f.value;
			debugmsg("CC OUT control "+this.cc);
		}
		f = document.getElementById("usercontrol");
		if( f != null){
			if( f.value != ""){
				this.cc = f.value;
				debugmsg("CC USER control "+this.cc);
			}
		}

		f = document.getElementById("mod");
		if( f != null){
			this.mod = f.value;		// modulation routing
		}
		f = document.getElementById("offset");
		if( f != null){
			this.offset = f.value;		// modulation routing
		}

	}

	// midi cc out used by learn.
	this.filter = function(op, chan, arg2, arg3, dev)
	{	const b = this.bit;
		const channel = this.groupobj.channel;

		if( op == 2){
			// if not OMNI and not this channel
			if( channel != 0 && channel != chan){
				return false;
			}
			if( midilearning && bitformaction == this){
				return learn(this, op, chan, arg2, arg3);
			}
		}
		return false;
	}

	// finish init.
	midiccout_list.adduniq( this, null);

}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// the midi group bits allow the editing of the midi filters
// interface
// channel
// splits
// the bits are not used by the "program"
//
midiGroupBit.prototype = Object.create(control.prototype);

function midiGroupBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.groupname = "Default";
	this.grouptype = 1;		// start as input
	this.midi = 0;
	this.channel = 0;
	this.paramnames = ["name", "type", "interface", "channel"];
	bit.color = "purple";
	bit.font = "14px Georgia";
	this.clockmode = 0;
	this.clocks = 0;
	this.clkstart = Date.now();

    let imagename = "midigroup";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;


    // Midi group bit self draw
	this.Draw = function( )
	{	var b = this.bit;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		ctx.save();
        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ this.bitimg ], b.x, b.y);
		}else {
			ctx.drawImage(bitpics[ this.bitimg+1 ], b.x, b.y);
		}
		if( this.grouptype == 1){
			b.drawText(ctx, " IN");
		}else {
			b.color = "green";
			b.drawText(ctx, "OUT");
		}
		ctx.restore();
	}

	// midigroup
	this.setData = function()
	{	let msg="";
		let g = null;
		let gtmsg;
		let md = null;
		let tempo = 0;


		if( bitform != null){
			bitform.innerHTML="";
		}

		midilearning = false;	// clear learning mode
		bitform = document.getElementById("bitform");
		if( bitform != null){
			g = getMidiGroupByName(this.groupname, this.grouptype);
			md = MIDIindev[g.midi];
			if( md != null){
				tempo = md.tempo;
			}
			msg += "<h2>Midi Group</h2>\n";
			msg = "<table>";
			if( g != null){
				msg += "<tr><th><input type='button' value='Name' onclick='UIeditname();' /></th><td><span id='groupedit'>"+showMidiGroups(this.grouptype, this.groupname,true)+"</span></td></tr>\n";
				if( this.grouptype == 1){
					// input
					msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(1, this.midi)+"</td></tr>\n";
					msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel, true)+"</td></tr>\n";
					msg += "<tr><th align='right'>Tempo</th><td > "+tempo+"</td></tr>\n";
				}else {
					msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(0, this.midi)+"</td></tr>\n";
					msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel, false)+"</td></tr>\n";
				}
			}
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}

	}

	// midi group filter bit
	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;
		let gn = null;

		f = document.getElementById("newname");
		if( f != null){
			gn = getMidiGroupByName(f.value, this.grouptype);
			if( gn == null){
				gn = getMidiGroup(0);
				gn.grouptype = this.grouptype;	// also inits the new group type.
				gn.name = f.value;
				if( this.grouptype == 1){
					gn.name += " Input";
				}else {
					gn.name += " Output";
				}
				debugmsg("getdata new "+gn.name);
				this.groupname = gn.name;
				this.groupobj = gn;
			}else {
				debugmsg("getdata found "+f.value);
				this.groupname = gn.name;
				this.groupobj = gn;
			}
		}
		f = document.getElementById("groupname");
		if( f != null){
			val = f.value;
			if(val == 0){
				debugmsg("New group");
			}
			gn = getMidiGroup(val);
			gn.grouptype = this.grouptype;	// also inits the new group type.

			if( this.groupname != gn.name){
				debugmsg("Change Groupname '"+this.groupname+"'  '"+gn.name+"' "+val);
				this.groupname = gn.name;
				this.midi = gn.midi;
				this.channel = gn.channel;
				return;
			}
		}
		if( f != null && gn == null){
			debugmsg("Getdata gn null val="+val);
			return;
		}


		if( this.grouptype == 1){
			f = document.getElementById("midiinsel");
			if( f != null){
				val = f.value;
				this.midi = val;
				gn.midi = val;
				selMIDIindev(val);
			}
		}else {
			f = document.getElementById("midioutsel");
			if( f != null){
				val = f.value;
				this.midi = val;
				gn.midi = val;
				this.outdev = selMIDIoutdev(val);
				gn.outdev = this.outdev;
			}
		}
		f = document.getElementById("midichannel");
		if( f != null){
			val = f.value;
			this.channel = val;
			gn.channel = val;
		}
		// update midi nodes.
	}

	this.doSave = function()
	{	let msg = "";
		let s = new saveargs();
		let b = this.bit;

		if( b == null){
			return;
		}
		// strings, numbers
// this.paramnames = ["name", "type", "interface", "channel"];
		let vs = [this.groupname, null, null, null];
		let vn =[0, this.grouptype, this.midi, this.channel];
		let i = 0;

		for(i=0; i < this.paramnames.length; i++){
			if( vs[i] != null){
				s.addnv(this.paramnames[i], stringValue(vs[i]));
			}else {
				s.addnv(this.paramnames[i], vn[i]);
			}
		}

		return s.getargs();
	}

	this.doLoad = function(initdata, idx)
	{	let len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";
		let b = this.bit;

		if( b == null){
			return;
		}

// this.paramnames = ["name", "type", "interface", "channel"];
		for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
			val = initdata[idx+n+1];
//			debugmsg("P "+param+" V "+val);

			if( param == "control"){
				continue;
			}
			if( param == "label"){
				this.label = val;
			}else if( param == "background"){
				this.background = val;
				b.background = val;
			}else if( param == "font"){
				this.font = val;
				b.font = val;
			}else if( param == "color"){
				this.color = val;
				b.color = val;
			}
		}
	}

}

// midi clock bit. 
// generate a value based on the midi clock
midiClockBit.prototype = Object.create(control.prototype);

function midiClockBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.groupobj = findGroupDefault(1);
	this.running = 0;
	this.data = 0;
	this.beats = 16;
	this.ticks = 0;
	this.tempo = 0;
	this.motion = new motion(120, 100);
	this.prevtempo = new delta();

    let imagename = "midiclk";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

	this.paramnames = ["source", "beats", "tempo"];

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

	// midi clock
	this.setValue = function(data, chan)
	{	const grp =  this.groupobj;
		let t = MIDIindev[grp.midi];

		if(t != null){
			this.tempo = t.tempo;
			this.ticks = t.clocks;
			if( this.tempo != 0 && this.prevtempo.changed(this.tempo)){
				this.motion.settempo(this.tempo, this.beats);
//				debugmsg("New tempo "+this.tempo);
			}
		}

		if( chan == 0){
			this.motion.step();
			this.step = this.motion.counter;
			if( this.motion.getgated()){
				this.bit.value = Math.floor(this.step);
				if(this.bit.value > 254 ){
					this.bit.value = 254;		// assume linked to seq so no 255 value.
				}else if( this.bit.value < 1){
					this.bit.value = 1;
				}
			}else {
				this.bit.value = 0;
			}

		}

	}

	// midi clock
    this.setData = function()
	{	let msg="";
		const grp =  this.groupobj;
		let t = MIDIindev[grp.midi];

		if(t != null){
			this.tempo = t.tempo;
		}

		if( bitform != null){
			bitform.innerHTML="";
		}
		midilearning = false;	// clear learning mode

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(1,grp.name, false)+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_in</td></tr>\n";
			msg += "<tr><th>Beats</th><td><input type='text' value='"+this.beats+"' /></td></tr>\n";
			msg += "<tr><th>Running</th><td><input type='text' value='"+this.running+"' /></td></tr>\n";
			msg += "<tr><th>Tempo</th><td><input type='text' value='"+this.tempo+"' /></td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

// midi clock
	this.getData = function()
	{	let f = null;
		let val = 0;

		f = document.getElementById("groupname");
		if( f != null){
			this.groupobj = getMidiGroup(f.value);
			debugmsg("CV "+this.groupobj.name+" "+this.groupobj.channel);
		}
	}

	this.onRemove = function()
	{
		let x = midicv_list.adduniq( this, null);
		x.ob = null;		// blank our reference
		midicv_list.removeobj(x);
	}

	// midiclock
	this.filter = function(op, dev)
	{	let b = this.bit;
		
		this.data++;
		if( this.data == 256){
			this.data = 0;
		}

		if( this.running == 0){
			b.value = this.data;
		}

		return false;
	}

	// finish init.
	midiclk_list.adduniq( this, null);
}



