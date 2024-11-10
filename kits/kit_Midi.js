///////////////////////////////////////////////////////////////
// web midi interface
// kit_midi.js

var outputlist = null;
var midiAccess = null;
var useMIDIin = null;
var useMIDIout = null;
var chosenOutput = 0;
var midiintarget = null;
var midiavail = false;
var midiinit = true;

MIDIoutdev_list = new objlist();
MIDIindev_list = new objlist();

function showMIDIinterfaces(inout, cur)
{
	let msg="";
	let m;
	let l;
	let cnt = 1;
	let sel="";

	if( inout == 1){	// inputs
		l = MIDIindev_list.head;

		msg += "<select id='midiinsel' >\n";
		msg += "<option value='0' "+isSelected(0, cur)+">Keyboard</option>\n";

		while(l != null){
			l.ob.count = cnt;
			msg += "<option value='"+cnt+"' "+isSelected(cnt, cur)+">"+l.ob.midi.value.name+"</option>";
			cnt++;
			l = l.next;
		}
		msg += "</select>\n";
		return msg;
	}

	if( inout == 0){
		msg = "";

		msg += "<select id='midioutsel' >\n";
		//  msg += "<option value='0'>Web Audio</option>\n";
		msg += "<option value='0' "+isSelected(0, cur)+">Don't use Midi</option>\n";

		cnt = 1;
		l = MIDIoutdev_list.head;
		while(l != null){
			l.ob.count = cnt;
			msg += "<option value='"+cnt+"' "+isSelected(cnt, cur)+" >"+l.ob.midi.value.name+"</option>";
			cnt++;
			l = l.next;
		}
		msg += "</select>\n";

		return msg;
	}
	return "Error";

}


function midi_process()
{
	if( midiinit){
		midiinit = false;
		if( navigator.requestMIDIAccess){
			navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject);
		}
	}
}

function MIDIobj(m)
{	this.midi = m;
	this.count = 0;

}

function onMIDIInit(midi){
	var indev, odev;
	var inputs;
	var outputs;

	midiAccess = midi;
	inputs = midiAccess.inputs.values();
	outputs = midiAccess.outputs.values();

	for( indev = inputs.next(); indev && !indev.done; indev = inputs.next() ){
		indev.value.onmidimessage = noMIDIMessageEventHandler;	// disable inputs
		MIDIindev_list.addobj(new MIDIobj(indev), null);
	}
	
	for( odev = outputs.next(); odev && !odev.done; odev = outputs.next() ){
		MIDIoutdev_list.addobj(new MIDIobj(odev), null);
	}

	activedomains |= 4;

}

function onMIDIReject(err){
	alert("Failed to init MIDI");
}

function noMIDIMessageEventHandler( e){
}

function ashex(x)
{
	return x.toString(16);
}


// interface event handlers
function MIDIMessageEventHandler0( e){
	MIDIMessageEventHandler( e, 0);
}

function MIDIMessageEventHandler1( e){
	MIDIMessageEventHandler( e, 1);
}

function MIDIMessageEventHandler2( e){
	MIDIMessageEventHandler( e, 2);
}

function MIDIMessageEventHandler3( e){
	MIDIMessageEventHandler( e, 3);
}


function MIDIMessageEventHandler( e, dev){
	let code = e.data[0] & 0xf0;
	let msg;
	let msg3=[0, 0, 0];
	let msg2= [0, 0];

	xdebugmsg = "Min("+dev+")"+ashex(e.data[0])+" "+ashex(e.data[1])+" "+ashex(e.data[2]);
	debugmsg( xdebugmsg);

	switch( code){
	case 0x90:
		if( e.data[2] != 0){
			msg3[0] = e.data[0];
			msg3[1] = e.data[1];
			msg3[2] = e.data[2];
			msg3[2] = 127;

//	xdebugmsg = "midiout handler("+msg3[0]+","+msg3[2]+")";
			midiinsetvalues("key-on", e.data[0]&0xf, msg3);
			return;
		}
		// note on with vel ==0 is a noteoff.
		msg3[0] = (e.data[0] & 0xf ) | 0x80;
		msg3[1] = e.data[1];
		msg3[2] = 0;
//	xdebugmsg = "midiout handler("+msg3[0]+","+msg3[2]+")";
		midiinsetvalues("key-off", e.data[0]&0xf, msg3);
		return;

	case 0x80:
		msg3[0] = e.data[0];
		msg3[1] = e.data[1];
		msg3[2] = e.data[2];
//	xdebugmsg = "midiout handler("+msg3[0]+","+msg3[2]+")";
		midiinsetvalues("key-off", e.data[0]&0xf, msg3);
		return;

	case 0xb0:		// control change
		msg3[0] = e.data[0];
		msg3[1] = e.data[1];
		msg3[2] = e.data[2];

		msg = "CC-"+e.data[1];

		if( e.data[1] == 106 ){
			prognum = (prognum - 1) & 0x7f;
			msg2[0] = 0xc0 | (e.data[0] & 0xf);
			msg2[1] = prognum;
			if( e.data[2] == 127){
				midiinsetvalues("programchange", e.data[0]&0xf, msg2);
			}
			return;
		}else if( e.data[1] == 107 ){
			prognum = (prognum + 1) & 0x7f;
			msg2[0] = 0xc0 | (e.data[0] & 0xf);
			msg2[1] = prognum;
			if( e.data[2] == 127){
				midiinsetvalues("programchange", e.data[0]&0xf, msg2);
			}
			return;
		}
// xdebugmsg = "MidiIN "+msg+"["+(e.data[0]&0x0f)+"] "+e.data[1]+" "+e.data[2];
		midiinsetvalues(msg, e.data[0]&0xf, msg3);

		return;

	}
	 // xdebugmsg = "MidiIN "+(e.data[0] & 0xf0)+"["+(e.data[0]&0x0f)+"] "+e.data[1]+" "+e.data[2];
}

function midiinsetvalues(name, arg1, arg2)
{	let n = name;
	let f;

	if( name == "key-on" || name == "key-off"){
		f = midicv_list.head;
		while(f != null){
			f.ob.filter(name, arg1, arg2);
			f = f.next;
		}
	}else if( name == "programchange"){

	}else {
		f = midicc_list.head;
		while(f != null){
			f.ob.filter(name, arg1, arg2);
			f = f.next;
		}
	}

	debugmsg("MIDI IN "+name+" "+arg1+" "+arg2);
}



/////////////////////////////////////////////////////////////


// midi kit
kit_midi.prototype = Object.create(sbmodule.prototype);

function kit_midi( )
{
	sbmodule.call(this, "Midi");
	// maps bit type to image type.
//                                      l     r           t     b
//  image, title, w, h, l-snap, r-snap, t-snap, b-snap
//			 snap style, isctrl, title, description
//					domainmask, menu, a, b
	this.bitnames = [
		"poweron", "power_on", 50, 50,		null, "powerout", null, null,			// 0
				0,	0, "Power On",		"Start a chain of SoftBits", 0x0010, "Power", 0, 1,	// 0
		"poweroff", "power_off", 50, 50,	"powerin", null, null, null,			// 1
				0,	0, "Power Off",		"End of a chain, optional.", 0x0001, "Power", 0, 1,	// 1
//		"midiin", "midi_in", 100, 50,	null, "midiout" ,null,  null,	// 22
//				0,	1, "midi_in",	"Midi Input Selector",	 0x0040, "Input", 0, 0,	// 7
		"midicv", "midi_cc",	50, 50,	null, "actionout" ,null,  null, // 24
				0,	1, "midi_cc",	"Midi CV filter",	 0x0010, "Action", 0, 0,	// 7
		"midicc", "midi_cv",	50, 50,	null, "actionout" ,null,  null,		// 		images for cv and cc reversed.
				0,	1, "midi_cv",	"Midi Note filter",	 0x0010, "Action", 0, 0,	// 7


//		"defaulta", "env_attack", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 31
//				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
//		"defaulta", "env_decay", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 32
//				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
//		"defaulta", "env_sustain", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 33
//				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
//		"defaulta", "env_release", 100, 50,		"actionin", "actionout" ,"actionin",  null,		//34
//				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
//		"defaulta", "env_value", 100, 50,		"actionin", "actionout" , null,  null,		// 35
//				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
//		"default", "glide", 100, 50,		"actionin","actionout" ,"actionin", null,		// 45
//				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
		null, null, null, null,				null, null, null, null
	];

	this.ctrltab = [
//  ID, len, args
	"midi_in", 3, 3,		// 
	"midi_cv", 3, 4,		// note filtewr
	"midi_cc", 3, 5,		// control code filter
	null, 0, 0, 0, 0	// end of table
	];


	this.bitimagemap = [
		"midiin", 1, 
		"midiin-v", 1, 
		"midicc", 1, 
		"midicc-v", 1, 
		"midicv", 1, 
		"midicv-v", 1, 
		"midiin-l", 0, 
		"midiin-t", 0, 
		"midiout-r", 0, 
		"midiout-b", 0, 
		null, null
	];

	// defines the op codes for the program. softbitslivs:execProgram
	this.kitctrlcodes = [
		"power_on", 0,
		"midi_cv", 4,
		"midi_cc", 5,
		null, 253
	];

	
	this.addCtrl = function( bit)
	{	let i=0;
		let ct = null;
		let name = bit.name;

		for(i=0; this.ctrltab[i] != null; i += this.ctrltab[i+1]){
			if( this.ctrltab[i] == name){
				// found control
				if( this.ctrltab[i+2] == 3){		// midin
					ct = new midiInBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 4){
					// note filter
					ct = new midiCVBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 5){
					// Control Cond filter
					ct = new midiCCBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}
			}
		}
	}


	this.getdomain = function()
	{
		if( midiinit == false ){
			activedomains |= 4;
			return 4;
		}
		return 0;
	}

	this.selected = function()
	{	let msg = "";

		midi_process();
	}



}

addkit( new kit_midi() );
new postkitload("Midi");

/////////////////////////////////////////////////////////////
