///////////////////////////////////////////////////////////////
// web midi interface
// kit_midi.js

var outputlist = null;
var midiAccess = null;
var useMIDIin = null;
var useMIDIout = null;
var chosenOutput = 0;
var midiavail = false;
var midiinit = true;
var miditargeting = null;
var midiclockmode = 0;		// all

MIDIoutdev_list = new objlist();
MIDIindev_list = new objlist();
MIDIindev = [ null, null, null, null, null];

// output interface selector
function showMIDIinterfaces(inout, cur)
{
	let msg="";
	let m;
	let l;
	let cnt = 1;
	let sel="";

	if( inout == 1){	// inputs
		l = MIDIindev_list.head;

		msg += "<select id='midiinsel' onchange='UImidiIndev();' >\n";
		msg += "<option value='0' "+isSelected(0, cur)+">Local</option>\n";

		while(l != null){
			l.ob.count = cnt;
			if(l.ob.connected){
				msg += "<option value='"+cnt+"' "+isSelected(cnt, cur)+">"+l.ob.midi.value.name+"</option>";
			}
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
		msg += "<option value='0' "+isSelected(0, cur)+">Local</option>\n";

		cnt = 1;
		l = MIDIoutdev_list.head;
		while(l != null){
			l.ob.count = cnt;
			if(l.ob.connected){
				msg += "<option value='"+cnt+"' "+isSelected(cnt, cur)+" >"+l.ob.midi.value.name+"</option>";
			}
			cnt++;
			l = l.next;
		}
		msg += "</select>\n";

		return msg;
	}
	return "Error";

}

// called when the interface in a group is changed.
function UImidiIndev()
{	let f = null;
	let g = null;

	if( bitform == null || bitformaction == null){
		return;
	}
	g = bitformaction.groupobj;
	f = document.getElementById("midiinsel");
	if( f != null){
		val = f.value;
		g.midi = val;
		selMIDIindev(val);
	}
	bitformaction.setData();		// refresh form.
}

function showMidiInOut(t)
{	let f = null;
	let md = null;

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


// learn mode
// called from the midigroup bitform.
// bitformaction will be a midigroup control.
function UIlearn(grpname)
{	let f = null;
	let g = null;
	let md = null;
	if( bitformaction == null){
		return;
	}
	f = document.getElementById("learn");
	if( f != null){
		g = bitformaction.groupobj;
		md = MIDIindev[g.midi];
		if( md != null){
			md.learn = f.value;
			miditargeting = null;
			if( f.value > 0){		// targeting
				miditargeting = md;
			}
		}
	}
	bitformaction.setData();		// refresh
}

// add to the interface target list
function UIlearnCC()
{
	if( bitformaction == null){
		return;
	}
	if( miditargeting != null){
		// use knob value of -1 to mark special case.
		midiAddTarget(bitformaction, -1);
	}

}

// midi target list handling.
// used to allow learn functionality.
// used to id entries in the list.
var midiTargetcount = 0;

// miditarget_list
function midiTarget( bit, knob, chan)
{	this.bit = bit;
	this.knob = knob;
	this.val = 0;
	this.id = midiTargetcount;
	this.channel = chan;

	midiTargetcount++;

}


// returns the list object
// target can be any control.
function midiAddTarget(bit, knob)
{	let chan = 0;
	let grp = null;

	if( miditargeting == null){
		return null;
	}
	chan = miditargeting.learnchan;
	let ob = miditargeting.learnlist.head;
	while(ob != null){
		if( ob.ob.bit == bit && ob.ob.knob == knob){
			return ob;	// already in list
		}
		ob = ob.next;
	}
	ob = miditargeting.learnlist.addobj(new midiTarget(bit, knob, chan), null);
	return ob;
}

function midiClearTargets()
{
	if( miditargeting == null){
		return null;
	}
	let ob = miditargeting.learnlist.head;
	while(ob != null){
		miditargeting.learnlist.removeobj(ob);
		ob = miditargeting.learnlist.head;	
	}
	midiTargetcount = 0;

}


// used to handle del and clear functions on the targetlist.
function UImidiTarget(op, id)
{
	if( miditargeting == null){
		return null;
	}
	let ob = miditargeting.learnlist.head;
	while(ob != null){
		if( ob.ob.id == id){
			if( op == 0){
				// del
				miditargeting.learnlist.removeobj(ob);
				break;
			}else if(op == 1){
				// clear
				ob.ob.val = 0;
				debugmsg("Clear "+ob.ob.bit.name+":"+ob.ob.knob);
				break;
			}
		}
		ob = ob.next;
	}
	if(bitformaction == null){
		return;
	}
	bitformaction.setData();		// refresh

}

function showMute(muted){
	let msg = "";

	msg += "<input type='button' value='Mute' onclick='UImute();' id='mute' ";
	if( muted){
		msg += "style='background-color: red;' ";
	}else {
		msg += "style='background-color: green;' ";
	}
	msg += "/>";

	return msg;
}

function UImute()
{
	let f = null;

	if( bitformaction == null){
		debugmsg("Mute not bit");
		return false;
	}

	f = document.getElementById("mute");
	if( f != null){
		if( bitformaction.mute){
			bitformaction.mute = false;
			f.style='background-color: green;';
		}else {
			bitformaction.mute = true;
			f.style='background-color: red;';
		}
	}else {
		debugmsg("UImute mute not found");
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
		this.name = "Group_"+n;
	}
	this.channel = 0;
	this.midi = null;
	this.outdev = null;
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

function getMidiGroupByName(name, dir)
{	let ret = null;
	let g = midiGroups_list.head;

	while(g != null){
		if( g.ob.name == name){
			return g.ob;
		}
		g = g.next;
	}
//	debugmsg("getmidigroup not found "+name+" "+dir);
	if( dir == 2){
		return null;
	}
	if(dir==1 ){
		name += " Input";
	}else {
		name += " Output";
	}
	ret = getMidiGroupByName(name, 2);	// 0 or 1. use 2 to stop recursion.

	return ret;
}

function MIDIslowTimer()
{
	this.run = function()
	{	let i = 0;

		for(i=0; i < MIDIindev.length; i++){
			if( MIDIindev[i] != null){
				MIDIindev[i].slowTimer();
			}
		}

	}

}

slowTimer_list.addobj(new MIDIslowTimer());

function doMidiClock(op, dev)
{	let f;
	let mclk = MIDIindev[dev];

	if( mclk != null){
		mclk.clock++;
	}

	f = midiclk_list.head;

	// run through the filter list
	while(f != null){
		if( f.ob.filter(op, dev)){
			break;	// processed it.
		}
		f = f.next;
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

// midi interface object wrapper. 
// midi is index into list of devices.

function MIDIobj(m)
{	this.midi = m;
	this.count = 0;;
	this.portid;
	this.clock = 0;
	this.clkstart = Date.now();
	this.running = 0;
	this.tempo = 0;
	this.learn = 0;
	this.learnlist = new objlist(); 	// of miditarget
	this.learnchan = 0;					// what channel when learning?
	this.connected = true;

	if( m != null){
		this.portid = m.id;
	}

	this.slowTimer = function()
	{	
		let now = Date.now();
		let millis = now - this.clkstart;

		this.clkstart = now;

		if(this.clock > 0 && millis > 0){
			this.tempo = (2500*this.clock) / millis;
			this.clock = 0;
		}

	}

}

function MIDIstateChange(event)
{   let port = event.port;
	let name = port.name;
	let type = port.type;
	let state= port.state;
	let dir = 0;
	let l;
	let o;
	let connected = false;

	if( state == "connected"){
		connected = true;
	}

//	debugmsg("MIDI "+type+" "+name+" "+state);

	if(type == "input"){
		dir = 1;
		l = MIDIindev_list.head;
	}else {
		l = MIDIoutdev_list.head;
	}
	while(l != null){
		o = l.ob;
		if( o.midi.value.name == name){
//			debugmsg("STATE found "+name);
			o.connected = connected;
			break;
		}

		l = l.next;
	}
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
	midiAccess.onstatechange = MIDIstateChange;

	activedomains |= 4;		// mark that midi objects can be used.

}

function onMIDIReject(err){
	alert("Failed to init MIDI");
}

// used as a sink when midi interfaces are not used.
function noMIDIMessageEventHandler( e){
}

function ashex(x)
{
	return x.toString(16);
}


// interface event handlers
function MIDIMessageEventHandler0( e){
	// local handler
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

function MIDIMessageEventHandler4( e){
	MIDIMessageEventHandler( e, 4);
}

function MIDIMessageEventHandler5( e){
	MIDIMessageEventHandler( e, 5);
}

function MIDIMessageEventHandler6( e){
	MIDIMessageEventHandler( e, 6);
}

function MIDIMessageEventHandler7( e){
	MIDIMessageEventHandler( e, 7);
}

function MIDIMessageEventHandler8( e){
	MIDIMessageEventHandler( e, 8);
}

function MIDIMessageEventHandler9( e){
	MIDIMessageEventHandler( e, 9);
}



function MIDIMessageEventHandler( e, dev){
	let code = e.data[0] & 0xf0;
	let msg;
	let msg3=[0, 0, 0];
	let msg2= [0, 0];
	xdebugmsg = "";

	if( e.data.length > 2){
		xdebugmsg = "Min("+dev+")"+ashex(e.data[0])+" "+ashex(e.data[1])+" "+ashex(e.data[2]);
	}else if( e.data.length > 1){
		xdebugmsg = "Min("+dev+")"+ashex(e.data[0])+" "+ashex(e.data[1]);
	}else {
		xdebugmsg = "Min("+dev+")"+ashex(e.data[0]);
	}

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

		midiinsetvalues(2, e.data[0]&0xf, msg3[1], msg3[2], dev);

		return;

	case 0xf0:
		// 
		if( e.data[0] == 0xf8 || e.data[0] == 0xfa || e.data[0] == 0xfb || e.data[0] == 0xfc ){
			doMidiClock(e.data[0], dev);
			return;
		}

	}
	debugmsg( xdebugmsg);
}


// process the midi events for note on/off and control change.
function midiinsetvalues( op, chan, arg, arg2, dev)
{	let n = op;
	let f;
	let md = MIDIindev[dev];

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
//	debugmsg("MIDI LEARN "+op+" "+chan+" "+arg+" "+arg2);

	if( md != null && op == 2){		// CC learnmodes.
		let obj;
		let o = md.learnlist.head;
		let on;

		// run through the filter list
		if( md.learn == 2){		// armed?
			while(o != null){
				obj = o.ob;
				if( obj.val == 0 && (obj.channel == 0 || obj.channel == chan)){
					debugmsg("target "+obj.bit.name+" "+obj.knob+" "+arg);
					obj.val = arg;
				}
				o = o.next;
			}
		}
		
		o = md.learnlist.head;

		// run through the filter list
		while(o != null){
			obj = o.ob;
			on = o.next;
			if( obj.val == arg && (obj.channel == 0 || obj.channel == chan)){
//				debugmsg("map cc "+obj.bit.name+" "+obj.knob+" "+arg+" "+arg2);
				if( obj.knob < 0){
					// special knob for CC learning
					obj.bit.setValue(arg, 2);
					md.learnlist.removeobj(o);
				}else {
					obj.bit.setValue(arg2, obj.knob+2);
				}
			}
			o = on;
		}
		return;
	}
	
	if( f == null ){
		debugmsg("MIDI IN ignored op="+op+" chan="+chan+" "+arg+" "+arg2);
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
		"midigroup", "midi_group_in",	50, 50,	null, null ,null,  null, // 24
				0,	1, "midi_group_in",	"Midi Group Input filter",	 0x0000, "Action", 0, 0,	
		"midigroup", "midi_group_out",	50, 50,	null, null ,null,  null, // 24
				0,	1, "midi_group_out",	"Midi Group Output filter",	 0x0000, "Action", 0, 0,	
		"midicv", "midi_cc",	50, 50,	null, "actionout" ,null,  null, // 24
				0,	1, "midi_cc",	"Midi CV filter",	 0x0010, "Input", 0, 0,	
		"midicc", "midi_cv",	50, 50,	null, "actionout" ,null,  null,		// 		images for cv and cc reversed.
				0,	1, "midi_cv",	"Midi Note filter",	 0x0010, "Input", 0, 0,	
		"midicv", "midi_ccout",	50, 50,	"actionin" ,"actionout","logicin",  null, // 24
				0,	1, "midi_ccout",	"Midi CV output",	 0x0111, "Output", 0, 0,	
		"midicc", "midi_cvout",	50, 50,	"actionin" ,"actionout", "logicin",  null,		// 		images for cv and cc reversed.
				0,	1, "midi_cvout",	"Midi Note output",	 0x0111, "Output", 0, 0,	

		"midiclk", "midi_clk",	50, 50,	"actionin", "actionout" ,null,  null, // 24
				0,	1, "midi_clk",	"Midi Clock",	 0x0011, "Input", 0, 0,	
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
	"midi_clk", 3, 10,		// Midi clock filter
	null, 0, 0, 0, 0	// end of table
	];


	this.bitimagemap = [
		"midiin", 0xd, 
		"midigroup", 0xd, 
		"midicc", 0xd, 
		"midicv", 0xd, 
		"midiclk", 0xd, 
		"midiin", 4, 	// -l -t
		"midiout", 8, 	// -r -b
		null, null
	];

	// defines the op codes for the program. softbitslivs:execProgram
	this.kitctrlcodes = [
		"power_on", 0,
		"midi_cv", 4,
		"midi_cc", 5,
		"midi_cvout", 6,
		"midi_ccout", 7,
		"midi_clk", 8,
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
					ct.groupname = "Default Input";
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 9){
					// Group filter
					ct = new midiGroupBit( bit);
					bit.ctrl = ct;
					ct.grouptype = 0;
					ct.groupname = "Default Output";
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 10){
					// Clock filter
					ct = new midiClockBit( bit);
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
		midiInitGroups();
	}



}

addkit( new kit_midi() );
new postkitload("Midi");

/////////////////////////////////////////////////////////////
