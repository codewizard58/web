// midibit.js
// midi control bits


// manage how notes are distributed

function notes()
{	this.start = null;
	this.stop = null;
	this.val = 0;
	this.stream = null;
}


// local Midi output handler.
var localOut = null;
function localMidiOut()
{	this.sending = 0;

	this.send = function(msg)
	{	let code = msg[0] & 0xf0;
		let msg3 = [0,0,0];
		let msg2 = [0,0];

//		debugmsg("LOCALOUT "+msg[0].toString(16)+" "+msg[1].toString(16));

		this.sending++;
		if( this.sending < 2){
			switch( code){
				case 0x90:
					if( msg[2] != 0){
						midiinsetvalues(1, msg[0]&0xf, msg[1], msg[2], 0);
						this.sending--;
						return;
					}
					// note on with vel ==0 is a noteoff.
					msg[0] = (msg[0] & 0xf ) | 0x80;
					msg[2] = 0;
					midiinsetvalues(0, msg[0]&0xf, msg[1], msg[2], 0);
					this.sending--;
					return;

				case 0x80:
					midiinsetvalues(0, msg[0]&0xf, msg[1], msg[2], 0);
					this.sending--;
					return;

				case 0xb0:		// control change
//					debugmsg("Local out CC"+msg[1]+" "+msg[2]);
					msg3[0] = msg[0];
					msg3[1] = msg[1];
					msg3[2] = msg[2];
			
					if( msg[1] == 106 ){
						prognum = (prognum - 1) & 0x7f;
						msg2[0] = 0xc0 | (msg[0] & 0xf);
						msg2[1] = prognum;
						if( msg[2] == 127){
							midiinsetvalues(3, msg[0]&0xf, msg2[0], msg2[1], 0);
						}
						this.sending--;
						return;
					}else if( msg[1] == 107 ){
						prognum = (prognum + 1) & 0x7f;
						msg2[0] = 0xc0 | (msg[0] & 0xf);
						msg2[1] = prognum;
						if( e.data[2] == 127){
							midiinsetvalues(4, msg[0]&0xf, msg2[0], msg2[1], 0, dev);
						}
						this.sending--;
						return;
					}
			// xdebugmsg = "MidiIN "+msg+"["+(e.data[0]&0x0f)+"] "+e.data[1]+" "+e.data[2];
					midiinsetvalues(2, msg[0]&0xf, msg3[1], msg3[2], 0);
			
					this.sending--;
					return;
		
			}
			// send msg
			debugmsg("Local send "+msg.length);
		}else {
			debugmsg("Sending > 1");
		}
		this.sending--;
	}

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
	while(l != null){
		if( l.ob.count == dev){
			useMIDIin = l.ob;
			if( dev == 0){
				debugmsg("Local Midi In");
				MIDIindev[dev] = useMIDIin;
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler0;
			}else if( dev == 1){
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
			}else if( dev == 5){
				MIDIindev[dev] = useMIDIin;
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler5;
			}else if( dev == 6){
				MIDIindev[dev] = useMIDIin;
				useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler6;
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

	if( dev == 0){
		if(localOut == null){
			useMIDIout = new localMidiOut();
			localOut = useMIDIout;
		}else {
			useMIDIout = localOut;
		}

		return useMIDIout;
	}
	while( l != null){
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
			drawImage( this.bitimg, b.x, b.y);
		}else {
			drawImage( this.bitimg+1 , b.x, b.y);
		}
	}

// midi CV (notes)
    this.setData = function()
	{	let msg="";
		const grp =  this.groupobj;

		if( bitform != null){
			bitform.innerHTML="";
		}

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(1,grp.name, false)+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_in</td></tr>\n";
			msg += "<tr><th>Channel</th><td><input type='text' value='"+grp.channel+"' /></td></tr>\n";
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

		chan++;		// 1 based

		// if not OMNI and not this channel
		if( channel != 0 && channel != chan){
			debugmsg("FILT CV "+channel+" chan="+chan);
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
	this.name = "MidiCC";


    // Midi control code bit self draw
	this.Draw = function( )
	{	var b = this.bit;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage(this.bitimg , b.x, b.y);
		}else {
			drawImage( this.bitimg+1 , b.x, b.y);
		}
	}

	// midicc
	this.setValue = function(data, func)
	{
		if( func == 2){
			// func 2 is CC learn mode.
			debugmsg("CC IN learn "+data+" old"+this.cc);
			this.cc = data;
			// remove from target list..
		}
		return;

	}


	// midicc
    this.setData = function()
	{	let msg="";
		const grp = this.groupobj;

		if( bitform != null){
			bitform.innerHTML="";
		}

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(1, grp.name, false)+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_in</td></tr>\n";
			msg += "<tr><th>Channel</th><td><input type='text' value='"+grp.channel+"' /></td></tr>\n";
			msg += "<tr><th>Control Code</th><td>"+showMidiControlCodes(this.cc);
			if( miditargeting != null){
				msg += "<input type='button' value='learn' onclick='UIlearnCC();' />\n";
			}
			msg += "</td></tr>";
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

		chan++;		// 1 based

		if( op == 2){
			// if not OMNI and not this channel
			if( channel != 0 && channel != chan){
				debugmsg("FILT CC "+channel+" chan="+chan);
				return false;
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
			drawImage( this.bitimg , b.x, b.y);
		}else {
			drawImage(this.bitimg+1 , b.x, b.y);
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
		let note = Math.floor(data/ 2);	// 0-127
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

		debugmsg("SETVAL CV chanx="+chanx);
		if( data < 16){
			note = 0;		// muted
		}
		if( grp.outdev == null){
//			debugmsg("OUTDEV null "+grp.name+" type"+grp.grouptype);
			return;
		}

		if( grp.midi != 0){
			mid = grp.outdev.midi.value.id;
			output = midiAccess.outputs.get(mid);
		}else {
			output = grp.outdev;		// local
		}

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

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(0, grp.name, false)+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_out</td></tr>\n";
			msg += "<tr><th>Channel</th><td><input type='text' value='"+grp.channel+"' /></td></tr>\n";
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
	this.prevnote = new delta();

    let imagename = "midicc";		
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = "midiccout";
	this.name = "MidiCCout";

    // Midi note out bit self draw
	this.Draw = function( )
	{	var b = this.bit;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage( this.bitimg , b.x, b.y);
		}else {
			drawImage(this.bitimg+1 , b.x, b.y);
		}
		if( this.mute){
			ctx.fillStyle = "#ff0000";
			ctx.fillRect(b.x+b.w-10,  b.y, 10, 10);
			ctx.fillStyle = "#ffffff";
		}
	}

	//ccout
	// midi cc output 
	this.setValue = function(data, func)
	{	let msg = [ 0xb0, 60, 127];
		let note = Math.floor(data/ 2);		// 0-127
		let mid = null;
		let output = null;
		const grp = this.groupobj;
		let chanx = grp.channel-1;		// 0 based
		let old;

		if( func == 1){
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

		if( func != 0){		// use input snap 0 only
			if( func == 2){
				// func 2 is CC learn mode.
				old = this.cc;
				debugmsg("CC learn "+data+" old"+old);
				this.cc = data;
				if( old != data){
					if( bitformaction == this){
						this.setData();		// refresh
					}
				}
				// remove from target list..
			}
			return;
		}

		if( grp.outdev == null){
			return;
		}

		if( grp.midi != 0){
			mid = grp.outdev.midi.value.id;
			output = midiAccess.outputs.get(mid);
		}else {
			output = grp.outdev;
		}

		note += (this.offset - 128) / 16;

		if( note < 0){		// clamp
			note = 0;
		}else if( note > 127){
			note = 127;
		}
		if( this.prevnote.changed(note)){
			msg[0] = 0xb0 | (chanx & 0xf);
			msg[1] = this.cc & 0x7f;
			msg[2] = note & 0x7f;
	
			if( !this.mute ){
				output.send(msg);
			}
		}

//		msg[0] = 0xb0 | (chanx & 0xf);
//		msg[1] = this.cc & 0x7f;
//		msg[2] = note & 0x7f;

//		if( !this.mute ){
//			output.send(msg);
//		}
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

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(0, grp.name, false)+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_out</td></tr>\n";
			msg += "<tr><th>Channel</th><td><input type='text' value='"+grp.channel+"' /></td></tr>\n";
			msg += "<tr><th>Control Code</th><td>"+showMidiControlCodes(this.cc);
			if( miditargeting != null){
				msg += "<input type='button' value='learn' onclick='UIlearnCC();' />\n";
			}
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
	this.groupobj = null;
	this.paramnames = ["name", "type", "interface", "channel"];
	bit.color = "purple";
	bit.font = "14px Georgia";

    let imagename = "midigroup";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;


    // Midi group bit self draw
	this.Draw = function( )
	{	var b = this.bit;
		var md = null;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
		if( this.grouptype == 1 && this.groupobj != null){
			md = MIDIindev[this.groupobj.midi];
		}

		ctx.save();
        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage( this.bitimg , b.x, b.y);
		}else {
			drawImage(this.bitimg+1 , b.x, b.y);
		}
		if( this.grouptype == 1){
			if( md != null && md.learn > 0){		// copy of mididev learn
				b.color = flash("purple", "white");
			}else {
				b.color = "purple";
			}
			b.drawText(ctx, " IN");
		}else {
			b.color = "green";
			b.drawText(ctx, "OUT");
		}
		ctx.restore();
	}

	this.showLearn = function(l)
	{	let learn= 0;
		let msg="";
		let md = null;

		if( this.groupobj != null){
			md = MIDIindev[this.groupobj.midi];
			if( md != null){
				learn = md.learn;
			}
		}
		msg += "<select id='learn' onchange='UIlearn("+'"'+this.groupname+'"'+")' >";
		msg += "<option value='0' "+isSelected(0, learn)+">Off</option>\n";
		msg += "<option value='1' "+isSelected(1, learn)+">Target</option>\n";
		msg += "<option value='2' "+isSelected(2, learn)+">Armed</option>\n";
		msg += "<option value='3' "+isSelected(3, learn)+">Done</option>\n";
		msg += "</select>\n";
		return msg;
	}

	// midigroup
	this.setData = function()
	{	let msg="";
		let g = this.groupobj;
		let md = null;
		let tempo = 0;
		let learn = 99;

		if( bitform != null){
			bitform.innerHTML="";
		}

		bitform = document.getElementById("bitform");
		if( bitform == null){
			debugmsg("Bitform == null");
			return;
		}
		bitformaction = this;
		if( this.groupobj == null){
			g = getMidiGroupByName(this.groupname, this.grouptype);
			this.groupobj = g;
		}
		if( this.grouptype == 1){
			md = MIDIindev[this.groupobj.midi];

			if(md != null){
				tempo = md.tempo;
				learn = md.learn;
			}
		}
		msg += "<h2>Midi Group</h2>\n";
		msg += "<table>";
		if( g != null){
			msg += "<tr><th><input type='button' value='Name' onclick='UIeditname();' /></th><td><span id='groupedit'>"+showMidiGroups(this.grouptype, this.groupname,true)+"</span></td></tr>\n";
			if( this.grouptype == 1){
				// input
				msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(1, g.midi)+"</td></tr>\n";
				msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(g.channel, true)+"</td></tr>\n";
				msg += "<tr><th align='right'>Tempo</th><td > "+tempo+"</td></tr>\n";
				msg += "<tr><th align='right'>Learning</th><td > "+this.showLearn(learn)+"</td></tr>\n";
				if( md != null){
					let t = md.learnlist.head;
					while(t != null){
						let ob = t.ob;
						msg += "<tr><td></td><td>"+ob.bit.name+":"+ob.knob+"</td>";
						if( learn == 1 ){
							msg+= "<td></td><td><input type='button' value='Del' onclick='UImidiTarget(0, "+'"'+ob.id+'"'+");' />";
						}else {
							msg+= "<td>"+ob.channel+":"+ob.val+"</td><td> <input type='button' value='Clear' onclick='UImidiTarget(1, "+'"'+ob.id+'"'+");' />";
						}

						msg += "</tr>\n";

						t = t.next;
					}
				}else {
					debugmsg("MD null");
				}
			}else {
				msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(0, g.midi)+"</td></tr>\n";
				msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(g.channel, false)+"</td></tr>\n";
			}
		}
		msg += "</table>\n";

		bitform.innerHTML = msg;

	}

	// midi group filter bit
	this.getData = function()
	{
		let f = null;
		let val = 0;
		let gn = null;
		let md = null;

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
				this.groupobj = gn;
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
				gn.midi = val;
				selMIDIindev(val);
				md = MIDIindev[val];
			}
		}else {
			f = document.getElementById("midioutsel");
			if( f != null){
				val = f.value;
				gn.midi = val;
				gn.outdev = selMIDIoutdev(val);
			}
		}
		f = document.getElementById("midichannel");
		if( f != null){
			val = f.value;
			gn.channel = val;		// 1 based
		}

		f = document.getElementById("learn");
		if( f != null){
			if( md != null){
				md.learn = f.value;
				if( f.value != 0){
					miditargeting = md;
				}
				md.learnchan = gn.channel;
			}
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
			drawImage( this.bitimg , b.x, b.y);
		}else {
			drawImage( this.bitimg+1 , b.x, b.y);
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



