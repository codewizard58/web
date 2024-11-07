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

function showMIDIinterfaces()
{	var mdiv;
	var msg="";
	var m;
	var l;
	var cnt = 1;

	// setup the UI
	mdiv = document.getElementById("midiindiv");
	if( mdiv != null ){
		l = MIDIindev_list.head;

		msg += "<select id='midiinsel' onchange='UIselMIDIindev()' >\n";
		msg += "<option value='0'>Keyboard</option>\n";

		while(l != null){
			l.ob.count = cnt;
			msg += "<option value='"+cnt+"' >"+l.ob.midi.value.name+"</option>";
			cnt++;
			l = l.next;
		}
		msg += "</select>\n";
		mdiv.innerHTML = msg;
	}

	mdiv = document.getElementById("midioutdiv");
	if( mdiv != null){
		msg = "";

		msg += "<select id='midioutsel' onchange='UIselMIDIoutdev();' >\n";
	//  msg += "<option value='0'>Web Audio</option>\n";
		msg += "<option value='0'>Don't use Midi</option>\n";

		cnt = 1;
		l = MIDIoutdev_list.head;
		while(l != null){
			l.ob.count = cnt;
			msg += "<option value='"+cnt+"'";
			if( cnt == chosenOutput){
				msg += "selected='selected' ";
			}
			msg += " >"+l.ob.midi.value.name+"</option>";
			cnt++;
			l = l.next;
		}
		msg += "</select>\n";

		mdiv.innerHTML = msg;
	}

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
		"midiin", "midi_in", 100, 50,	null, "midiout" ,null,  null,	// 22
				0,	1, "midi_in",	"Midi Input Selector",	 0x0040, "Input", 0, 0,	// 7
		"midicv", "midi_cc",	50, 50,	"midiin", "actionout" ,null,  null, // 24
				0,	1, "midi_cc",	"Midi CV filter",	 0x0014, "Action", 0, 0,	// 7
		"midicc", "midi_cv",	50, 50,	"midiin", "actionout" ,null,  null,		// 		images for cv and cc reversed.
				0,	1, "midi_cv",	"Midi Note filter",	 0x0014, "Action", 0, 0,	// 7


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
		if( actx == null){
			actx = checkaudiocontext();
		}
		if( audioOK){
			activedomains |= 2;
			return 2;
		}
		return 0;
	}

	this.selected = function()
	{	let msg = "";

		msg += "<table><tr ><th>Midi IN</th><td>"
		msg += "<div id='midiindiv' ></div>\n";
		msg += "</td></tr>\n";
		msg += "<tr ><th>Midi OUT</th><td>";
		msg += "<div id='midioutdiv' ></div>\n";
		msg += "</td></tr>\n";
		msg += "</table>\n";

		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			bitform.innerHTML = msg;
		}

		midi_process();
		showMIDIinterfaces();
	}



}

addkit( new kit_midi() );
new postkitload("Midi");

/////////////////////////////////////////////////////////////
