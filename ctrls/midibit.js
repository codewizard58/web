// midibit.js
// midi control bits

// manage how notes are distributed

// null midi output interface
function MIDInoOutput()
{	this.sending = 0;

	this.send = function(msg)
	{

	}
}

var noOutput = null;

// local Midi output handler.
var localOut = null;

function localMidiOut()
{	this.sending = 0;

	this.send = function(msg)
	{	let code = msg[0] & 0xf0;
		let msg3 = [0,0,0];
		let msg2 = [0,0];

//		debugmsg("LOCALOUT["+msg.length+"] "+msg[0].toString(16)+" "+msg[1].toString(16));

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

				case 0xa0:				// 
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
				case 0xc0:
					this.sending--;
					return;
		
				case 0xd0:
					this.sending--;
					return;

				case 0xe0:
					this.sending--;
					return;
				}
			// send msg
			debugmsg("Local send "+msg.length+" "+code.toString(16));
		}else {
			debugmsg("Sending > 1 "+this.sending);
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


var midiclk_list = new objlist();

// used by learn function.
var midicvout_list = new objlist();
var midiccout_list = new objlist();


function selMIDIindev(dev)
{	let l = MIDIindev_list.head;	// list of interfaces
	let useMIDIin = null;


	if( dev == 0){
		if( MIDIindev[dev] == null){
			useMIDIin = new MIDIinputobj(null);
			useMIDIin.name = "local";
			MIDIindev[dev] = useMIDIin;
		}
		return;
	}

	if( l != null){
		debugmsg("Sel in "+dev+" "+l.ob.name+" "+l.ob.index);
	}
	while(l != null){
		if( l.ob.index == dev){
			useMIDIin = l.ob;
			if( MIDIindev[dev] == null){
				MIDIindev[dev] = useMIDIin;
			}else if( MIDIindev[dev] != useMIDIin ){
				debugmsg("MIDI dev mismatch "+dev);
			}
			
			if( dev == 1){
				useMIDIin.midiport.onmidimessage = MIDIMessageEventHandler1;
				debugmsg("Sel 1");
			}else if( dev == 2){
				useMIDIin.midiport.onmidimessage = MIDIMessageEventHandler2;
				debugmsg("Sel 2");
			}else if( dev == 3){
				useMIDIin.midiport.onmidimessage = MIDIMessageEventHandler3;
			}else if( dev == 4){
				useMIDIin.midiport.onmidimessage = MIDIMessageEventHandler4;
			}else if( dev == 5){
				useMIDIin.midiport.onmidimessage = MIDIMessageEventHandler5;
			}else if( dev == 6){
				useMIDIin.midiport.onmidimessage = MIDIMessageEventHandler6;
			}else if( dev == 7){
				useMIDIin.midiport.onmidimessage = MIDIMessageEventHandler7;
			}else if( dev == 8){
				useMIDIin.midiport.onmidimessage = MIDIMessageEventHandler8;
			}else if( dev == 9){
				useMIDIin.midiport.onmidimessage = MIDIMessageEventHandler9;
			}else {
				debugmsg("Sel nothing");
			}
			l = null;
		}else {
			l = l.next;
			debugmsg("Sel not "+dev);
		}
	}

}


//////////////////////////////////////////////////////////////////////////////

function selMIDIoutdev(dev)
{
	let l = MIDIoutdev_list.head;
	let useMIDIout = null;

	if( dev == 0){
		if(localOut == null){
			useMIDIout = new MIDIoutputobj(null);
			useMIDIout.output = new localMidiOut();
			localOut = useMIDIout;
			MIDIoutdev_list.addobj(localOut, null);
		}else {
			useMIDIout = localOut;
		}
// debugmsg("sel local");
		return useMIDIout;
	}
	while( l != null){
		if( l.ob.index == dev){
			useMIDIout = l.ob;
//			debugmsg("sel ret "+dev+" "+useMIDIout.name);
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

function isChecked(a)
{
    if( a ){
        return "checked";
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
    msg+= "<option value='-1' "+isSelected(-1, sel)+" >MPE</option>";
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
 84, "Portamento Amount", 0,
 128, "=================", 0,
 129, "Chan Aftertouch", 0,
 130, "Poly Aftertouch", 0,
 131, "Pitchbend", 0
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
		msg += "<br />User CC# <input type='text' value='"+cc+"' id='usercontrol' size='4' /> ";
	}else {
		msg += "<br />User CC# <input type='text' value='' id='usercontrol' size='4' /> ";
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
		let channel = grp.channel;

		if( bitform != null){
			bitform.innerHTML="";
		}
		if( channel == 0){
			channel = "OMNI";
		}

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(1,grp.name, false)+"</td><th>Channel</th><td>"+channel+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_in</td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

// midi CV (notes)
	this.getData = function()
	{	let f = null;
		let s = new saveargs();


		f = document.getElementById("groupname");
		if( f != null){
			s.addarg("groupname");
			s.addarg(f.value);
		}

		this.doLoad(s.getdata(), 0);

	}

	// midicv input
	this.doSave = function()
	{	let msg = "";
		let s = new saveargs();
		let b = this.bit;

		if( b == null){
			return;
		}
		s.addnv("control", "'midicv-in'")

		return s.getargs();
	}


	//midicv
	this.doLoad = function(initdata, idx)
	{	let len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";
		let curgrp = this.groupobj;

		for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
			val = initdata[idx+n+1];

			if( param == "'control'" || param == "control"){
				continue;
			}
			if( param == "groupname"){
				if( val > 0){
					debugmsg("CVgroupname "+val);
					this.groupobj = getMidiInGroup(val);
					if( this.groupobj.name != curgrp.name){
						debugmsg("CV change group");
						curgrp.disconnect_cv(this);
						this.groupobj.connect_cv(this);
					}
				}
			}
		}
		debugmsg("CV doload "+this.groupobj.name+" "+this.groupobj.channel);

	}

	this.onRemove = function()
	{
	}

	// midicv
	this.filter = function(op, chan, arg2, arg3, dev)
	{	let b = this.bit;
		let note = arg2+arg2;				// use * 2
		let channel = this.groupobj.channel;

		if( dev != this.groupobj.midicnt){
			debugmsg("Midicv dev"+dev+" "+this.groupobj.midicnt);
			return false;					// not this midi interface.
		}

		chan++;		// 1 based

		// if not OMNI and not this channel
		if( channel != 0 && channel != chan){
//			debugmsg("FILT CV "+channel+" chan="+chan);
			return false;
		}
		if( note == 0){
			// force note off
			b.value = 0;
			this.note = 0;
			return false;				// allow all channels to get this.
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
	this.groupobj.connect_cv(this);
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
		return;
	}


	// midicc
    this.setData = function()
	{	let msg="";
		const grp = this.groupobj;
		let channel = grp.channel;

		if( bitform != null){
			bitform.innerHTML="";
		}
		if( channel == 0){
			channel = "OMNI";
		}

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(1,grp.name, false)+"</td><th>Channel</th><td>"+channel+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_in</td></tr>\n";
			msg += "<tr><th>Control<br />Change</th><td colspan='4'>"+showMidiControlCodes(this.cc);
			if( miditargeting != null){
				msg += "<br /><input type='button' value='learn' onclick='UIlearnCC();' />\n";
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
		let s = new saveargs();


		f = document.getElementById("groupname");
		if( f != null){
			s.addarg("groupname");
			s.addarg(f.value);
		}
		f = document.getElementById("usercontrol");
		if( f != null){
			if( f.value != ""){
				s.addarg("cc");
				s.addarg(f.value);
			}else {
				f = document.getElementById("control");
				if( f != null){
					s.addarg("cc");
					s.addarg(f.value);
				}
			}
		}

		this.doLoad(s.getdata(), 0);

	}
	// midicv input
	this.doSave = function()
	{	let msg = "";
		let s = new saveargs();
		let b = this.bit;

		if( b == null){
			return;
		}
		s.addnv("control", "'midicc-in'");

		if( this.groupobj != null){
			s.addarg("groupname");
			s.addarg(stringValue(this.groupobj.name));
		}

		return s.getargs();
	}



	//midicc
	this.doLoad = function(initdata, idx)
	{	let len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";
		let curgrp = this.groupobj;

		for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
			val = initdata[idx+n+1];

			if( param == "'control'" || param == "control"){
				continue;
			}
			if( param == "groupname"){
				if( val > 0){
					this.groupobj = getMidiInGroup(val);
					if( this.groupobj.name != curgrp.name){
						debugmsg("CC change group");
						curgrp.disconnect_cc(this);
						this.groupobj.connect_cc(this);
					}
				}
			}
			if( param == "cc"){
				this.cc = val;
			}
			if( param == "mod"){
				this.mod = val;		// modulation routing
			}
			if( param == "offset"){
				this.offset = val;		// modulation routing
			}
		}
		debugmsg("CV doload "+this.groupobj.name+" "+this.groupobj.channel);

	}

	this.onRemove = function()
	{
	}

	// midi cc  called by op = 2,5,6,7  change, bend, touch, pressure
	this.filter = function(op, chan, arg2, arg3, dev)
	{	const b = this.bit;
		const channel = this.groupobj.channel;
		let data;

		if( dev != this.groupobj.midicnt){
			return false;					// wrong midi interface
		}

		chan++;		// 1 based

		if( channel != 0 && channel != chan){
			debugmsg("FILT CC "+channel+" chan="+chan);
			return false;
		}
		if( op == 2){
			// if not OMNI and not this channel
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
		}else if(op == 5){			// pitchbend
//			debugmsg("cc filt dev="+dev+"/"+this.groupobj.midicnt+" op="+op+" "+arg2+" "+arg3);
			if( this.cc != 131)
			{
				return false;
			}
			data = ((arg3*128 )+arg2) / 64;
			this.data = data;
			b.value = this.data;

		}else if(op == 6){		// chan aftertouch
//			debugmsg("cc filt dev="+dev+"/"+this.groupobj.midicnt+" op="+op+" "+arg2+" "+arg3);
			if( this.cc != 129)
			{
				return false;
			}
			this.data = arg2+arg2 ;
			b.value = this.data;

		}else if(op == 7){		// poly aftertouch
			debugmsg("cc filt dev="+dev+"/"+this.groupobj.midicnt+" op="+op+" "+arg2+" "+arg3);
			if( this.cc != 130)
			{
				return false;
			}
			this.data = ((arg3*128 )+arg2) / 64;
			b.value = this.data;
	
		}
		return true;
	}

	this.groupobj.connect_cc(this);
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
			debugmsg("Outdev CV == null");
			return;
		}
		output = grp.outdev.output;	

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
//				debugmsg("SETVAL CV chanx="+chanx+" "+note);
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
			msg += "<tr><th>Group</th><td>"+showMidiGroups(0,grp.name, false)+"</td><th>Channel</th><td>"+grp.channel+"</td></tr>\n";
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
				g = getMidiOutGroup(f.value);
				if( g != this.groupobj){
					debugmsg("out group changed");
					this.groupobj = g;
				}
				if( this.groupobj == null){
					this.groupobj = getNoteGroup(f.value);
				}
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
	this.prevnote.changed(256);		// no prev value can match

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
			return;
		}

		if( grp.outdev == null){
			debugmsg("Outdev == null");
			return;
		}

		output = grp.outdev.output;	

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
			msg += "<tr><th>Group</th><td>"+showMidiGroups(0,grp.name, false)+"</td><th>Channel</th><td>"+grp.channel+"</td></tr>\n";
			msg += "<tr><th>Configure</th><td>Action/midi_group_out</td></tr>\n";
			msg += "<tr><th>Control<br />Change</th><td colspan='4' >"+showMidiControlCodes(this.cc);
			if( miditargeting){
				msg += "<br /><input type='button' value='learn' onclick='UIlearnCC();' />\n";
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
		let s = new saveargs();

		s.addnv("control", "'midiccout'");
	
		f = document.getElementById("groupname");
		if( f != null){
			s.addarg("groupname");
			s.addarg( f.value);
		}
		f = document.getElementById("usercontrol");
		if( f != null){
			if( f.value != ""){
				s.addarg("cc");
				s.addarg( f.value);
			}else {
				f = document.getElementById("control");
				if( f != null){
					s.addarg("cc");
					s.addarg( f.value);
				}
			}
	
		}

		f = document.getElementById("mod");
		if( f != null){
			s.addarg("mod");
			s.addarg( f.value);
			this.mod = f.value;		// modulation routing
		}
		f = document.getElementById("offset");
		if( f != null){
			s.addarg("offset");
			s.addarg( f.value);
			this.offset = f.value;		// modulation routing
		}

		this.doLoad(s.getdata(), 0);

	}

	this.doLoad = function(initdata, idx)
	{	let len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";

		for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
			val = initdata[idx+n+1];

			if( param == "'control'" || param == "control"){
				continue;
			}
			if( param == "groupname"){
				if( val > 0){
					this.groupobj = getMidiOutGroup(val);
				}
			}
//			debugmsg("Midiccout  "+idx+" "+len+ " "+param+"="+val);
			if( param == "cc"){
				if( val != this.cc){
					this.prevnote.changed(256);	// make sure to re-send on change
				}
				this.cc = val;
				//			debugmsg("CC OUT control "+this.cc);
			}
			if( param == "mod"){
				this.mod = val;		// modulation routing
			}
			if( param == "offset"){
				this.offset = val;		// modulation routing
			}
		}
	}		



	// finish init.
	midiccout_list.adduniq( this, null);

}


function UIrefresh(code, arg)
{	let f;
	let midi = 0;
	let md = null;
	let ng;

	if( bitformaction == null){
		return;
	}
	const bit = bitformaction.bit;
	const ctrl = bitformaction;

	if( code == 2){
		// add notegroup to interface
		f = document.getElementById("midiinsel");
		if( f != null){
			midi = f.value;
			md = MIDIindev[midi];
			md.connect(ctrl.groupobj);
			ctrl.groupobj.midicnt = midi;
		}
	}else if(code == 3){	// delete notegroup from interface.
		f = document.getElementById("midiinsel");
		if( f != null){
			midi = f.value;
			md = MIDIindev[midi];

			// find note group "arg" by name
			ng = noteGroups_list.head;
			while(ng != null){
				if( ng.ob.name == arg){
					break;
				}
				ng = ng.next;
			}
			if( ng != null){
				debugmsg("NG Del "+arg);
				md.disconnect(ng.ob );
			}

		}
	}else if(code == 1){	// graph bit
		bitformaction.getData();
		if( arg == 1){				// run
			bitformaction.curpos = 1;
		}
	}

	bitformaction.setData();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// the midi group bits allow the editing of the midi filters
// interface
// channel
// the bits are not used by the "program"
// splits splitGroupBit
// notegroups noteGroupBit
// targets targetGroupBit

// find interface/notegroup by index.
function findMIDIinterface(cur)
{	let md = null;
	let l;

	if( cur < 10){
		md = MIDIindev[cur];
	}else {
		l = noteGroups_list.head;
		while(l != null){
			if( l.ob.index == cur){
				md = l.ob;
				break;
			}
			l = l.next;
		}
	}
	return md;
}

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

		ctx.save();
        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage( this.bitimg , b.x, b.y);
		}else {
			drawImage(this.bitimg+1 , b.x, b.y);
		}
		if( this.grouptype == 1){
			b.color = "purple";
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
		let g = this.groupobj;
		let md = null;
		let tempo = 0;

		if( bitform != null){
			bitform.innerHTML="";
		}

		bitform = document.getElementById("bitform");
		if( bitform == null){
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
			}
		}
		msg += "<table>";
		if( g != null){
			msg += "<tr><th><input type='button' value='Name' onclick='UIeditname();' /></th><td><span id='groupedit'>"+showMidiGroups(this.grouptype, this.groupname,true)+"</span></td></tr>\n";
			if( this.grouptype == 1){
				// input
				msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(5, g.midicnt, null)+"</td></tr>\n";
				msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(g.channel, true)+"</td></tr>\n";
				if( tempo > 0){
					msg += "<tr><th>Tempo</th><td><input type='text' value='"+tempo+"' /></td></tr>\n";
				}
			}else {
				msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(0, g.midicnt, null)+"</td></tr>\n";
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
		let cur;

		f = document.getElementById("newname");
		if( f != null){
			gn = getMidiGroupByName(f.value, this.grouptype);
			if( gn == null){
				gn = new midiGroup(0, this.grouptype);
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
				gn = new midiGroup(0, this.grouptype);
				if( this.grouptype == 1){
					gn.name += " Input";
				}else {
					gn.name += " Output";
				}
			}else {
				if( this.grouptype == 1){
					gn = getMidiInGroup(val);
				}else {
					gn = getMidiOutGroup(val);
				}
			}
			if( gn != null){
				gn.grouptype = this.grouptype;	// also inits the new group type.

				if( this.groupname != gn.name){
					debugmsg("Change Groupname '"+this.groupname+"'  '"+gn.name+"' "+val);
					this.groupname = gn.name;
					this.groupobj = gn;
					return;
				}
			}
		}

		if( f != null && gn == null){
			debugmsg("Getdata gn null val="+val);
			return;
		}

		if( this.grouptype == 1){
			cur = gn.midicnt;
			f = document.getElementById("midiinsel");
			if( f != null){
				val = 1*f.value;
				gn.midicnt = val;
				if( val < 10){
					selMIDIindev(val);
					md = MIDIindev[val];
				}
				if( cur != val){
					md = findMIDIinterface(cur);
					if( md != null){
						md.disconnect(gn);
					}

					md = findMIDIinterface(val);
					if( md != null){
						md.connect(gn);
					}
				}
			}
		}else {
			f = document.getElementById("midioutsel");
			if( f != null){
				val = f.value;
				debugmsg("G selout "+val);
				gn.midicnt = val;
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
		}
		// update midi nodes.
	}

	// groupbit
	this.doSave = function()
	{	let msg = "";
		let s = new saveargs();
		let b = this.bit;
		let g = this.groupobj;

		if( b == null){
			return;
		}
		// strings, numbers
// this.paramnames = ["name", "type", "interface", "channel"];
		let vs = [this.groupname, null, null, null];
		let vn =[0, this.grouptype, g.midicnt, g.channel];
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
	// draw() generic control

	// midi clock
	this.setValue = function(data, chan)
	{	const grp =  this.groupobj;
		let t = MIDIindev[grp.midicnt];

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
		let t = MIDIindev[grp.midicnt];

		if(t != null){
			this.tempo = t.tempo;
		}

		if( bitform != null){
			bitform.innerHTML="";
		}

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Group</th><td>"+showMidiGroups(5,grp.name, false)+"</td></tr>\n";
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
			this.groupobj = getMidiInGroup(f.value);
			debugmsg("CV "+this.groupobj.name+" "+this.groupobj.channel);
		}
	}

	this.onRemove = function()
	{
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

noteGroupBit.prototype = Object.create(control.prototype);

function noteGroupBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.groupname = "Default";
	this.grouptype = 1;		// start as input
	this.groupobj = null;

    let imagename = "notegroup";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

	// draw() generic control

	// for the interface, show which notegroups are attached.
	this.showNotes = function(md)
	{	let msg = "";
		let ng;
		if( md != null){
			let t = md.filter_list.head;
			if( md.mpe == 0){
				msg += "<tr><th><input type='button' value='Add' onclick='UIrefresh(2, "+'""'+");' /></th></tr>";
			}
			while(t != null){
				ng = t.ob;
				if( ng.ichannel >= 0){
					msg += "<tr><th>"+ng.name+"</th><td><input type='button' value='Del' onclick='UIrefresh(3, "+'"'+ng.name+'"'+");' />";
				}else {
					msg += "<tr><th>"+ng.name+"</th><th>Zone "+ng.zone+"</th><th>Channels</th><td>"+ng.chans;
				}
				msg += "</td></tr>";
				t = t.next;
			}
		}
		return msg;
	}

	this.shownotelist = function(ng)
	{	let msg = "";
		let n;

		if(ng == null){
			return "";
		}

		msg += "<table><tr>";
		for(n=0; n < ng.notes.length; n++)
		{
			if( ng.notes[n] != null){
				msg += "<td>"+ng.notes[n].note+"</td>";
			}else {
				msg += "<td>&nbsp;</td>";
			}
	}
		msg += "</tr></table>";
		return msg;
	}

	//notegroups
	this.setData = function()
	{	let msg="";
		const grp =  this.groupobj;
		let md = null;
		let name = "";
		let midi = 0;
		let ichannel = 0;
		let notemode = 0;
		
		if( grp != null){
			// grp is notegrpoup
			md= MIDIindev[grp.midicnt];
			name = grp.name;
			midi = grp.midi;
			ichannel = grp.ichannel;
			notemode = grp.notemode;
		}

		if( bitform != null){
			bitform.innerHTML="";
		}

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>\n";
			msg += "<tr><th><input type='button' value='Name' onclick='UIeditname();' /></th><td><span id='groupedit'>"+showNoteGroups(this.grouptype, this.groupname,true)+"</span></td></tr>\n";
			msg += "<tr><th>Notes</th><td><span id='notelist'>"+this.shownotelist(grp)+"</span></td></tr>\n";
			msg += "<tr><th><select id='notemode' ><option value='0' "+isSelected(notemode, 0)+">Poly</option><option value='1' "+isSelected(notemode, 1)+">Unison</option></select></th>";
			msg += "</tr>\n";
			if( ichannel >= 0){
				msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(1, midi, null)+"</td><th>Input Channel</th><td>"+MidiChannelSelector(ichannel, true)+"</td></tr>\n";
			}else {
				msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(1, midi, null)+"</td><th>Input Mode</th><td>MPE</td></tr>\n";
			}
			if( md != null){
				msg += this.showNotes(md);
			}
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}

	}

	// midi notegroup filter bit
	this.getData = function()
	{
		let f = null;
		let val = 0;
		let gn = null;
		let md = null;

		f = document.getElementById("newname");
		if( f != null){
			gn = getNoteGroupByName(f.value);
			if( gn == null){
				gn = new noteGroup(0);
				gn.name = f.value;

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
				debugmsg("New Note group");
			}
			gn = getNoteGroup(val);

			if( gn != null && this.groupname != gn.name){
				debugmsg("Change Groupname '"+this.groupname+"'  '"+gn.name+"' "+val);
				this.groupname = gn.name;
				this.groupobj = gn;			// notegroup
				return;
			}
		}
		if( gn == null){
			return;
		}
		f = document.getElementById("midichannel");
		if( f != null){
			val = f.value;
			if( gn.ichannel == -1){
				val = -1;				// cannot change MPE mode.
			}
			if( val != gn.ichannel){
				gn.alloff();
			}
			gn.ichannel = val;
		}
		f = document.getElementById("notemode");
		if( f != null){
			val = f.value;
			if( val != gn.notemode){
				gn.alloff();
			}
			gn.notemode = val;
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////

splitGroupBit.prototype = Object.create(control.prototype);

function splitGroupBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.groupname = "Default";
	this.grouptype = 1;		// start as input
	this.groupobj = null;

    let imagename = "splitter";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

	// splitter
	// draw - generic control

	this.showSplits = function(md)
	{	let msg = "";
		if( md != null){
			let t = md.splitter_list.head;
		}
		return msg;
	}

	// splitgroupbit
	this.setData = function()
	{	let msg="";
		const grp =  this.groupobj;
		let md = null;
		let name = "";
		
		if( grp != null){
			md= MIDIindev[grp.midicnt];
			name = grp.name;
		}

		if( bitform != null){
			bitform.innerHTML="";
		}

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg += "<tr><th>Group</th><td>"+showMidiGroups(1,name, false)+"</td></tr>\n";
			msg += this.showSplits(md);

			bitform.innerHTML = msg;
			bitformaction = this;
		}

	}

}


targetGroupBit.prototype = Object.create(control.prototype);

function targetGroupBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.midicnt = 0;
	this.channel = 0;
	this.groupobj = null;
	this.chantype = 2;

    let imagename = "target";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;


	// targetting editor

	this.showTargets = function(md)
	{	let msg = "";
		if( md != null){
			let t = miditarget_list.head;
			while(t != null){
				let ob = t.ob;
				if( ob.midicnt == md){
					if( ob.bit == null){
						msg += "<tr><td></td><td>Unset: Unknown</td>";
					}else {
						msg += "<tr><td></td><td>"+ob.bit.name+":"+ob.knob+"</td>";
					}
					if( ob.learn == 1 ){
						msg+= "<td></td><td><input type='button' value='Del' onclick='UImidiTarget(0, "+'"'+ob.id+'"'+");' />";
					}else {
						msg+= "<td>"+ob.channel+":"+ob.val+"</td><td> <input type='button' value='Clear' onclick='UImidiTarget(1, "+'"'+ob.id+'"'+");' />";
					}

					msg += "</tr>\n";
				}

				t = t.next;
			}
		}
		return msg;
	}

	this.setData = function()
	{	let msg="";

		if( bitform != null){
			bitform.innerHTML="";
		}

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg += "<table>\n";
			msg += "<tr><th>Interface</th><td>"+showMIDIinterfaces(5, this.midicnt, null)+"</td></tr>\n";
			msg += "<tr><th align='right'>Channel</th><td > "+MidiChannelSelector(this.channel, true)+"</td></tr>\n";
			msg += "<tr><th>New</th><td><input type='button' value='Learn' onclick='UIlearn();' /></td><td>";
			msg += "<select id='chantype' ><option value='2' "+isSelected(this.chantype, 2)+">Control Change</option>\n";
			msg += "<option value='6'  "+isSelected(this.chantype, 6)+">Chan Aftertouch</option>\n";
			msg += "<option value='7'  "+isSelected(this.chantype, 7)+">Poly Aftertouch</option>\n";
			msg += "<option value='5'  "+isSelected(this.chantype, 5)+">Pitchbend</option>\n";
			msg += "</select>\n";
			msg += "</td></tr>\n";
			msg += "<tr><td colspan='4' ><hr /></td></tr>\n";
			msg += this.showTargets(this.midicnt);
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}

	}

	// target filter bit
	this.getData = function()
	{
		let f = null;
		let val = 0;

		f = document.getElementById("midiinsel");
		if( f != null){
			val = f.value;
			this.midicnt = val;
		}

		f = document.getElementById("midichannel");
		if( f != null){
			val = f.value;
			this.channel = val;
		}
		f = document.getElementById("chantype");
		if( f != null){
			val = f.value;
			this.chantype = val;
		}
		debugmsg("Target get "+this.midicnt+" "+this.channel);
	}

}


