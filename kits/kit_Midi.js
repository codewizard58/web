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
	
	this.bitnames = [
//		"defaulta", "osc_squelch", 100, 50,	"actionin", "actionout", null,  null,	// 21
//				0,	0, "",	"",	 0x1, "Action", 0, 0,	// 7
		"midiin", "midi_in", 100, 50,	null, "inputout" ,null,  null,	// 22
				0,	1, "midi_in",	"",	 0x0040, "Input", 0, 0,	// 7
//		"default", "midi_gate",  100, 50,	"actionin", "actionout" ,null, "actionout",	// 23
//				0,	0, "",	"",	 0x1, "Action", 0, 0,	// 7
		"control", "midi_cc",	100, 50,	"actionin", "actionout" ,"actionin",  null, // 24
				0,	1, "midi_cc",	"",	 0x0040, "Action", 0, 0,	// 7
		"default", "midi_cv",	100, 50,	"actionin", "actionout" ,null,  null,		// 25
				0,	1, "midi_cv",	"",	 0x0040, "Action", 0, 0,	// 7


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
	"midi_cv", 3, 5,		// 
	"midi_cc", 3, 6,		// 
	null, 0, 0, 0, 0	// end of table
	];


	this.bitimagemap = [
		"midiin", 1, 
		null, null
	];

	// defines the op codes for the program. softbitslivs:execProgram
	this.kitctrlcodes = [
		"power_on", 0,
		null, 253
	];

	


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
