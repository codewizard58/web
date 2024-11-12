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

function showMidiInOut(t)
{
	let msg = "";
	msg += "<select id='grouptype' onchange='UImidiInOut();' >\n";
	msg += "<option value='1' "+isSelected(1, t)+" >Input</option>\n";
	msg += "<option value='0' "+isSelected(0, t)+" >Output</option>\n";
	msg += "</select>\n";

	return msg;
}

function UImidiInOut()
{
	if( bitformaction != null)
	{
		debugmsg("UImidiInOut()");
		bitformaction.getData();
		bitformaction.setData();
	}
}

var midiGroups_list = new objlist();
var nextgroup = 0;

// called with the next group number
//	1 Default in, 2 default out 
function midiGroup(n)
{
	this.index = n;

	this.grouptype = 1;		// input default
	if(n==1 ){
		this.name = "Default Input";
	}else if( n == 2){
		this.name = "Default Output";
		this.grouptype = 0;	// output default.
	}else {
		this.name = "group_"+n;
	}
	this.channel = 0;
	this.midi = null;
}

function getMidiGroup(val)
{	let g = midiGroups_list.head;
	let gn = null;

	if( val > 0){
		while(g != null){
			if( g.ob.index == val){
				return g.ob;
			}
			g = g.next;
		}
	}

	nextgroup++;
	gn = new midiGroup(nextgroup);
	midiGroups_list.addobj( gn, null);
	return gn;
}

function listMidiGroups(dir, arg)
{
	let msg = "";
	let g = midiGroups_list.head;
	let gn = null;
	let dirmsg = "";
	if( dir == 0){
		dirmsg=" (OUT)";
	}else if(dir == 1){
		dirmsg=" (IN)";
	}
	while(g != null){
		if( g.ob.grouptype == dir){
			msg += "<option value='"+g.ob.index+"' "+isSelected(g.ob.name, arg)+" >"+g.ob.name+dirmsg+"</option>\n";
		}
		g = g.next;
	}
	return msg;
}

function findGroupDefault(dir)
{
	let g = midiGroups_list.head;
	let name;

	if( dir == 1){
		name = "Default Input";
	}else {
		name = "Default Output";
	}

	while(g != null){
		if( g.ob.grouptype == dir){
			if( g.ob.name == name){
				return g.ob;
			}
		}
		g = g.next;
	}
	return null;
}

function showMidiGroups(dir, arg, cannew)
{
	let msg = "";

	msg += "<select id='groupname' onchange='UImidiGroups();' >\n";
	if( dir == 1 || dir == 2){
		msg += listMidiGroups(1, arg);
	}
	if( dir == 0 || dir == 2){
		msg += listMidiGroups(0, arg);
	}
	if( cannew){
		msg += "<option value='"+0+"' >New Group</option>\n";
	}
	msg += "</select>\n";

	return msg;
}

function midiInitGroups()
{
	let gn = null;
	// bootstrap
	if( midiGroups_list.head == null){
		gn = getMidiGroup(0);
		gn = getMidiGroup(0);
	}
	
}

function UImidiGroups()
{
	if( bitformaction != null)
	{
		bitformaction.getData();
		bitformaction.setData();
	}
}

function getMidiGroupByName(name)
{
	let g = midiGroups_list.head;

	while(g != null){
		if( g.ob.name == name){
			return g.ob;
		}
		g = g.next;
	}
	return null;
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
	this.portid = m.id;

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

	if( e.data.length > 2){
		xdebugmsg = "Min("+dev+")"+ashex(e.data[0])+" "+ashex(e.data[1])+" "+ashex(e.data[2]);
	}else if( e.data.length > 1){
		xdebugmsg = "Min("+dev+")"+ashex(e.data[0])+" "+ashex(e.data[1]);
	}else {
		xdebugmsg = "Min("+dev+")"+ashex(e.data[0]);
	}

//	debugmsg( xdebugmsg);

	switch( code){
	case 0x90:
		if( e.data[2] != 0){
			msg3[0] = e.data[0];
			msg3[1] = e.data[1];
			msg3[2] = e.data[2];
			msg3[2] = 127;

//	xdebugmsg = "midiout handler("+msg3[0]+","+msg3[2]+")";
			midiinsetvalues(1, e.data[0]&0xf, msg3[1], msg3[2], dev);
			return;
		}
		// note on with vel ==0 is a noteoff.
		msg3[0] = (e.data[0] & 0xf ) | 0x80;
		msg3[1] = e.data[1];
		msg3[2] = 0;
//	xdebugmsg = "midiout handler("+msg3[0]+","+msg3[2]+")";
		midiinsetvalues(0, e.data[0]&0xf, msg3[1], msg3[2], dev);
		return;

	case 0x80:
		msg3[0] = e.data[0];
		msg3[1] = e.data[1];
		msg3[2] = e.data[2];
//	xdebugmsg = "midiout handler("+msg3[0]+","+msg3[2]+")";
		midiinsetvalues(0, e.data[0]&0xf, msg3[1], msg3[2], dev);
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
				midiinsetvalues(3, e.data[0]&0xf, msg2[0], msg2[1], dev);
			}
			return;
		}else if( e.data[1] == 107 ){
			prognum = (prognum + 1) & 0x7f;
			msg2[0] = 0xc0 | (e.data[0] & 0xf);
			msg2[1] = prognum;
			if( e.data[2] == 127){
				midiinsetvalues(4, e.data[0]&0xf, msg2[0], msg2[1], 0, dev);
			}
			return;
		}
// xdebugmsg = "MidiIN "+msg+"["+(e.data[0]&0x0f)+"] "+e.data[1]+" "+e.data[2];
		midiinsetvalues(2, e.data[0]&0xf, msg3[1], msg3[2], dev);

		return;

	}
	 // xdebugmsg = "MidiIN "+(e.data[0] & 0xf0)+"["+(e.data[0]&0x0f)+"] "+e.data[1]+" "+e.data[2];
}

function midiinsetvalues( op, chan, arg, arg2, dev)
{	let n = op;
	let f;

	chan++;		// midi channels are 1 origin.

	if(op ==2){
		f = midicc_list.head;
	}else {
		f = midicv_list.head;
	}
	// run through the filter list
	while(f != null){
		if( f.ob.filter(op, chan, arg, arg2, dev)){
			break;	// processed it.
		}
		f = f.next;
	}
	
	if( f == null){
		debugmsg("MIDI IN ignored "+op+" "+chan+" "+arg+" "+arg2);
	}
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
		"midigroup", "midi_group_in",	50, 50,	null, null ,null,  null, // 24
			0,	1, "midi_group_in",	"Midi Group Input filter",	 0x0000, "Action", 0, 0,	// 7
		"midigroup", "midi_group_out",	50, 50,	null, null ,null,  null, // 24
			0,	1, "midi_group_out",	"Midi Group Output filter",	 0x0000, "Action", 0, 0,	// 7
		"midicv", "midi_cc",	50, 50,	null, "actionout" ,null,  null, // 24
				0,	1, "midi_cc",	"Midi CV filter",	 0x0010, "Input", 0, 0,	// 7
		"midicc", "midi_cv",	50, 50,	null, "actionout" ,null,  null,		// 		images for cv and cc reversed.
				0,	1, "midi_cv",	"Midi Note filter",	 0x0010, "Input", 0, 0,	// 7
		"midicv", "midi_ccout",	50, 50,	"actionin" ,null, null,  null, // 24
				0,	1, "midi_ccout",	"Midi CV output",	 0x0001, "Output", 0, 0,	// 7
		"midicc", "midi_cvout",	50, 50,	"actionin" ,null, null,  null,		// 		images for cv and cc reversed.
				0,	1, "midi_cvout",	"Midi Note output",	 0x0001, "Output", 0, 0,	// 7


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
	"midi_cv", 3, 4,		// note filter
	"midi_cc", 3, 5,		// control code filter
	"midi_cvout", 3, 6,		// note filter
	"midi_ccout", 3, 7,		// control code filter
	"midi_group_in", 3, 8,		// Midi group filter
	"midi_group_out", 3, 9,		// Midi group outputfilter
	null, 0, 0, 0, 0	// end of table
	];


	this.bitimagemap = [
		"midiin", 1, 
		"midiin-v", 1, 
		"midigroup", 1, 
		"midigroup-v", 1, 
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
		"midi_cvout", 6,
		"midi_ccout", 7,
		null, 253
	];

	
	this.addCtrl = function( bit)
	{	let i=0;
		let ct = null;
		let name = bit.name;

		for(i=0; this.ctrltab[i] != null; i += this.ctrltab[i+1]){
			if( this.ctrltab[i] == name){
				// found control
				if( this.ctrltab[i+2] == 4){
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
				}else if( this.ctrltab[i+2] == 6){
					// note output
					ct = new midiCVOutBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 7){
					// Control Cond output
					ct = new midiCCOutBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 8){
					// Group filter
					ct = new midiGroupBit( bit);
					bit.ctrl = ct;
					ct.grouptype = 1;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 9){
					// Group filter
					ct = new midiGroupBit( bit);
					bit.ctrl = ct;
					ct.grouptype = 0;
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
		midiInitGroups();
	}



}

addkit( new kit_midi() );
new postkitload("Midi");

/////////////////////////////////////////////////////////////
