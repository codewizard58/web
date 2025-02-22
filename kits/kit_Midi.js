///////////////////////////////////////////////////////////////
// web midi interface
// kit_midi.js
// 11/24/24  onstatechange
// 1/20/25

var outputlist = null;
var midiAccess = null;
var chosenOutput = 0;
var midiavail = false;
var midiinit = true;
var midiclockmode = 0;		// all
var miditargeting = null;	// if not null this is used to tell that the next knob moved is to be the target.
var g_transport = null;
var calldepth = 0;			// to stop recursive looping.

var MIDIoutdev_list = new objlist();
var MIDIindev_list = new objlist();
var MIDIindev = [ null, null, null, null, null];
var miditarget_list = new objlist();

function MIDIremove(list, obj)
{	let f = list.head;
	let fn;

	while(f != null){
		fn = f.next;
		if( f.ob == obj){
			f.next = fn;
			if( fn != null){
				fn.prev = f.prev;
			}
			if( list.head == f){
				list.head = fn;
			}
			// unlinked
			f.next = null;
			f.prev = null;
			f.ob = null;
//			debugmsg("unlinked");
			return;
		}
		f = fn;
	}
}

// output interface selector
// also show notegroups
// and splitters

function showMIDIinterfaces(inout, cur, id)
{
	let msg="";
	let m;
	let l;
	let cnt = 1;
	const dir = inout & 3;
	let sel = "";
	let ocnt = 0;

	if( dir == 1){	// inputs
		l = MIDIindev_list.head;

		if( id != null){
			msg += "<select id='"+id+"' onchange='UImidiIndev();' >\n";
		}else {
			msg += "<select id='midiinsel' onchange='UImidiIndev();' >\n";
		}
		msg += "<option value='0' "+isSelected(0, cur)+">Local</option>\n";

		while(l != null){
			m = l.ob;
			if(l.ob.connected == true){
				sel = isSelected(cnt, cur);
				if( sel == "selected"){
					ocnt++;
				}
				msg += "<option value='"+cnt+"' "+sel+">"+l.ob.name+"</option>";
			}
			cnt++;
			l = l.next;
		}
		if( (inout & 4) == 4){
			l = noteGroups_list.head;
			while(l != null){
				m = l.ob;
				sel = isSelected(m.index, cur);
				if( sel == "selected"){
					ocnt ++;
				}
				msg += "<option value='"+m.index+"' "+sel+">NG-"+l.ob.name+"</option>";
				l = l.next;
			}
		}

		msg += "</select>\n";
		return msg;
	}

	if( dir == 0){
		msg = "";
		if( id != null){
			msg += "<select id='"+id+"' >\n";
		}else {
			msg += "<select id='midioutsel' >\n";
		}
		//  msg += "<option value='0'>Web Audio</option>\n";
		msg += "<option value='0' "+isSelected(0, cur)+">Local</option>\n";

		cnt = 1;
		l = MIDIoutdev_list.head;
		while(l != null){
			if(l.ob.connected == true){
				msg += "<option value='"+l.ob.index+"' "+isSelected(l.ob.index, cur)+" >"+l.ob.name+"</option>";
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
	let cur;
	let md = null;

	if( bitform == null || bitformaction == null){
		return;
	}
	g = bitformaction.groupobj;
	f = document.getElementById("midiinsel");
	if( f != null && g != null){
		cur = g.midicnt;
		val = f.value;
		debugmsg("UIMidiIndev "+val);
		g.midicnt = val;
		if( val < 10){
			selMIDIindev(val);
			md = MIDIindev[val];
		}
		if( cur != val){
			md = findMIDIinterface(cur);
			if( md != null){
				md.disconnect(g);
			}

			md = findMIDIinterface(val);
			if( md != null){
				md.connect(g);
			}
		}
	}else {
		debugmsg("UImidiindev getdata");
		bitformaction.getData();
	}
	bitformaction.setData();		// refresh form.
}


// learn mode
// called from the target bitform.
// bitformaction will be a target control.
function UIlearn()
{	let md = null;
	let mt = null;

	if( bitformaction == null){
		return;
	}

	bitformaction.getData();

	md = findMIDIinterface(bitformaction.midicnt);
	mt = new midiTarget(null, null, bitformaction.channel);
	mt.learn = 1;					// learn mode
	mt.midicnt = bitformaction.midicnt;
	mt.chantype = bitformaction.chantype;
	debugmsg("Learn "+mt.midicnt+" "+bitformaction.channel+" type="+mt.chantype);
	miditargeting = mt;
	md.connect(mt);

	bitformaction.setData();		// refresh
}

// add to the interface target list
function UIlearnCC()
{
	if( bitformaction == null){
		return;
	}

	if( miditargeting != null){
		o = midiAddTarget(bitformaction.bit, -1);

		bitform.innerHTML = "";
		bitformaction = null;
		bitform = null;
	}
	
}

// midi target list handling.
// used to allow learn functionality.
// used to id entries in the list.
var midiTargetcount = 0;

// miditarget_list
midiTarget.prototype = Object.create( MIDIfilter.prototype);

function midiTarget( bit, knob, chan)
{	MIDIfilter.call(this);
	this.name = "Target";
	this.bit = bit;
	this.knob = knob;
	this.val = 0;
	this.id = midiTargetcount;
	this.channel = chan;
	this.learn = 0;			// 1 = armed.
	this.midicnt = 0;		// interface.
	this.chantype = 2;

	midiTargetcount++;

	this.filter = function(op, chan, arg, arg1, dev)
	{	let chanx = chan+1;
		let val = 0;
		let md = null;
		let t = null;
		let tar = null;

		if( this.channel > 0 &&  this.channel != chanx){
			return false;
		}
		if( this.learn == 2){
			if( op == 2 && this.chantype == 2){
				debugmsg("Target filt: "+op+" "+chan+" "+arg+" knob="+this.knob);
					this.val = arg;
					this.learn = 3;		// done learning
			}else if( op == this.chantype){  // pitchbend or aftertouch
				debugmsg("Target filt: "+op+" "+chan+" "+arg+" knob="+this.knob);
				this.learn = 3;
			}
			// else learn will still be 2.
			if( this.learn == 3){
				if( this.knob == -1){	// common for CC and CCout
					// cc bit 
					md = findMIDIinterface(this.midicnt);
					if( this.chantype == 2){
						this.bit.ctrl.cc = arg;
					}else if( this.chantype == 5){		// pitchbend
						this.bit.ctrl.cc = 131;
					}else if( this.chantype == 6){		// chan after
						this.bit.ctrl.cc = 129;
					}else if( this.chantype == 7){		// poly after
						this.bit.ctrl.cc = 130;
					}
					debugmsg("Set bit "+this.bit.name+" to cc "+this.bit.ctrl.cc);

					// add the bit to the filter and remove the target
//					debugmsg("Disconnect target");
					md.disconnect(this);
//					debugmsg("Remove target");
					let t = miditarget_list.head;
					while(t != null){
						tar = t.ob;
						if( tar.midicnt == this.midicnt){
							if(tar.id == this.id){
//								debugmsg("learncc found "+this.id+" "+tar.midicnt);
								miditarget_list.removeobj(t);
								break;
							}
						}
						t = t.next;
					}
				}
				return true;
			}
		}else if(this.learn == 3){
			if( this.chantype == 2 && arg == this.val){
				this.bit.setValue(arg1+arg1, this.knob*1+2);
			}else if( this.chantype == op){
				if( op == 5){
					val = arg1+arg1+(arg / 64);
				}else if(op == 6){
					val = arg+arg;
				}else {
//					debugmsg("TFilt "+op+" "+val);
					val = arg;
				}
				this.bit.setValue(val, this.knob*1+2);
			}
		}
		return false;
	}

	miditarget_list.addobj(this);

}

function findTarget(bit, knob)
{	let t = miditarget_list.head;

	while(t != null){
		if( t.ob.bit == bit && t.ob.knob == knob){
			return t.ob;
		}
		t = t.next;
	}
	return null;
}
// returns the list object
// target can be any control.
function midiAddTarget(bit, knob)
{	let chan = 0;
	let grp = null;
	let t = miditarget_list.head;


	while( t != null){
		debugmsg("Addtarget "+t.ob.learn);
		if( t.ob.learn == 1){
			if( t.ob.bit == null){
				t.ob.bit = bit;
				t.ob.knob = knob;
				t.ob.learn = 2;
				miditargeting = null;
				return t.ob;
			}
		}else {
			if( t.ob.bit == null){
				debugmsg("Addtarget null");
			}

		}
		t = t.next;
	}

	t = new midiTarget(bit, knob, -1);
	t.learn = 2;
	miditargeting = t;
	debugmsg("Add target new "+knob+" "+t.learn);

	return t;
}

function midiClearTargets()
{

}


// used to handle del and clear functions on the targetlist.
function UImidiTarget(op, id)
{	let md = null;
	let grp = null;
	let t = null;
	let tar=null;

	if(bitformaction == null){
		return;
	}
	md = findMIDIinterface(bitformaction.midicnt);

	t = miditarget_list.head;
	while(t != null){
		tar = t.ob;

		if( tar.midicnt == bitformaction.midicnt){
			if(tar.id == id){
				debugmsg("MT found "+id+" "+tar.midicnt+" op="+op);
				if( op == 0){		// del
					md.disconnect(tar);
					miditarget_list.removeobj(t);
					break;
				}else if(op == 1){	// clear
					tar.learn = 1;
					tar.var = 0;
				}
			}
		}

		t = t.next;
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

var midiInGroups_list = new objlist();
var midiOutGroups_list = new objlist();
var noteGroups_list = new objlist();
var splitGroups_list = new objlist();
var nextgroup = 10;

// called with the next group number
//	1 Default in, 2 default out 

function midiGroup(n, dir)
{	
	this.index = n;

	this.grouptype = dir;		// input default
	if(n==1 ){
		this.name = "Default Input";
		this.grouptype = 1;	
		this.midicnt = 0;
	}else if( n == 2){
		this.name = "Default Output";
		this.grouptype = 0;	// output default.
	}else {
		if( n == 0){
			nextgroup++;
			n = nextgroup;
		}
		this.name = "Group_"+n;
		this.index = n;
	}
	if( this.grouptype == 1){
		this.note_list = new objlist();
		this.cc_list = new objlist();
	}else {
		// output
		this.note_list = null;
		this.cc_list = null;
	}
	this.channel = 0;
	this.outdev = null;

	this.connect_cv = function(obj)
	{
		debugmsg("G CONNECT ");
		this.note_list.addobj(obj, null);
		obj.parent = this;	

	}

	this.connect_cc = function(obj)
	{	let f = null;
		debugmsg("G CONNECT CC "+this.name);
		this.cc_list.addobj(obj, null);
		obj.parent = this;	

	}

	this.disconnect_cv = function(obj)
	{
		debugmsg("G DISCONNECT ");

		MIDIremove(this.note_list, obj );
		
	}

// midigroup
	this.disconnect_cc = function(obj)
	{	debugmsg("G DISCONNECT CC ");

		MIDIremove(this.cc_list, obj );		
	}

	// midigroup
	this.filter = function(op, chan, arg, arg2, dev)
	{	let l;

		if( op == 1 || op == 0){
			l = this.note_list.head;
		}else {
			l = this.cc_list.head;
		}

		if( l != null){
//			debugmsg("Group Filt "+op+" "+chan+" "+arg);
		}
		while(l != null){
			if( l.ob != null ){
				l.ob.filter(op, chan, arg, arg2, dev);
			}
			l = l.next;
		}

		return false;
	}

	this.print = function()
	{	let n = this.note_list;
		let c = this.cc_list;

		debugmsg("___ Group N "+this.name);
		if( n != null){
			n = n.head;
			while(n != null){
				if( n.ob != null){
					n.ob.print();
				}

				n = n.next;
			}
		}
		debugmsg("___ Group CC "+this.name);
		if(c != null){
			c = c.head;
			while(c != null){
				if( c.ob != null){
					c.ob.print();
				}
				c = c.next;
			}
		}

	}

	this.onRemove = function()
	{	let g = midiInGroups_list.head;
		let gnext;

		if( this.grouptype == 1){
			debugmsg("MG onRemove "+this.name);

			g = this.note_list.head;
			while(g != null){
				gnext = g.next;
				this.disconnect_cv( g.ob);

				g = gnext;
			}

			g = this.cc_list.head;
			while(g != null){
				gnext = g.next;
				this.disconnect_cc( g.ob);

				g = gnext;
			}

			g = midiInGroups_list.head;
			while(g != null){
				if( g.ob == this){
					debugmsg("Remove group "+this.name);
					midiInGroups_list.removeobj(g);
					break;
				}
				g = g.next;
			}
		}

	}


	if( dir == 1){
		midiInGroups_list.addobj(this);
	}else {
		midiOutGroups_list.addobj(this);
	}
}

function getMidiInGroup(val)
{	let g = midiInGroups_list.head;

	if( val > 0){
		while(g != null){
			if( g.ob.index == val){
				return g.ob;
			}
			g = g.next;
		}
	}
	return null;
}

function getMidiOutGroup(val)
{	let g = midiOutGroups_list.head;

	if( val > 0){
		while(g != null){
			if( g.ob.index == val){
				return g.ob;
			}
			g = g.next;
		}
	}
	return null;
}

function getNoteGroup(val)
{	let g = noteGroups_list.head;

	if( val > 0){
		while(g != null){
			if( g.ob.index == val){
				return g.ob;
			}
			g = g.next;
		}
	}

	return null;
}

function listMidiGroups(dir, arg)
{
	let msg = "";
	let g;
	let gn = null;
	let dirmsg = "";
	if( dir == 0){
		dirmsg=" (OUT)";
		g = midiOutGroups_list.head;
	}else if(dir == 1){
		dirmsg=" (IN)";
		g = midiInGroups_list.head;
	}
	while(g != null){
		if( g.ob.grouptype == dir){
			msg += "<option value='"+g.ob.index+"' "+isSelected(g.ob.name, arg)+" >"+g.ob.name+dirmsg+"</option>\n";
		}
		g = g.next;
	}
	msg += "<option value='-1' "+isSelected(-1, arg)+" > -- </option>\n";
	return msg;
}

function listNoteGroups( arg)
{
	let msg = "";
	let g = noteGroups_list.head;
	let dirmsg = "";

	while(g != null){
		msg += "<option value='"+g.ob.index+"' "+isSelected(g.ob.name, arg)+" >NG-"+g.ob.name+dirmsg+"</option>\n";
		g = g.next;
	}
	return msg;
}

function findGroupDefault(dir)
{
	let g;
	let name;

	if( dir == 1){
		name = "Default Input";
		g = midiInGroups_list.head;
	}else {
		name = "Default Output";
		g = midiOutGroups_list.head;
	}

	while(g != null){
		if( g.ob.grouptype == dir){
			if( g.ob.name == name){
				return g.ob;
			}
		}
		g = g.next;
	}
//	debugmsg("GROUP "+name+" not found");
	return null;
}

function showMidiGroups(dir, arg, cannew)
{
	let msg = "";
	let mode = dir & 3;

	msg += "<select id='groupname' onchange='UImidiGroups();' >\n";
	if( mode == 1 || mode == 2){
		msg += listMidiGroups(1, arg);
	}
	if( mode == 0 || mode == 2){
		msg += listMidiGroups(0, arg);
	}
	if( cannew){
		msg += "<option value='"+0+"' >New Group</option>\n";
	}
	if( (dir & 4) == 4){
		// show notegroups
		msg += listNoteGroups( arg);
	}
	msg += "</select>\n";

	return msg;
}

function showNoteGroups(dir, arg, cannew)
{
	let msg = "";

	msg += "<select id='groupname' onchange='UImidiGroups();' >\n";
	if( dir == 1 || dir == 2){
		msg += listNoteGroups( arg);
	}
	if( cannew){
		msg += "<option value='"+0+"' >New Group</option>\n";
	}
	msg += "</select>\n";

	return msg;
}

function midiInitGroups()
{	let md = null;
	let gn = null;
	// bootstrap
	if( midiInGroups_list.head == null){
		gn = new midiGroup(1, 1);
		md = findMIDIinterface(0);
		if( md != null){
			md.connect(gn);
		}
	}
	if( midiOutGroups_list.head == null){
		gn = new midiGroup(2, 0);
		// connect default to local.
		gn.outdev = selMIDIoutdev(0);
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
{
	let g;

	if(dir==1 ){
		g = midiInGroups_list.head;
	}else {
		g = midiOutGroups_list.head;
	}

	while(g != null){
		if( g.ob.name == name){
			return g.ob;
		}
		g = g.next;
	}

	// try with suffix
	if(dir==1 ){
		name += " Input";
		g = midiInGroups_list.head;
	}else {
		name += " Output";
		g = midiOutGroups_list.head;
	}
	while(g != null){
		if( g.ob.name == name){
			return g.ob;
		}
		g = g.next;
	}

	return null;
}

function getNoteGroupByName(name)
{	let ret = null;
	let g = noteGroups_list.head;

	while(g != null){
		if( g.ob.name == name){
			return g.ob;
		}
		g = g.next;
	}

	return ret;
}

function MIDIslowTimer()
{
	this.run = function(now)
	{	let i = 0;

		for(i=0; i < MIDIindev.length; i++){
			if( MIDIindev[i] != null){
				MIDIindev[i].slowTimer(now);
			}
		}

	}
	return false;	// call again.
}

slowTimer_list.addobj(new MIDIslowTimer());

function doMidiClock(op, dev)
{	let f;
	let mclk = MIDIindev[dev];

	if( mclk != null){
		if( mclk.transport == null){
			mclk.transport = new transport();
		}
		mclk.midiclock();
	}

	f = midiclk_list.head;

	// run through the filter list
	while(f != null){
		if( f.ob != null && f.ob.filter(op, dev)){
			break;	// processed it.
		}
		f = f.next;
	}

}

function midi_process()
{	let md;

	if( midiinit){
		midiinit = false;
		if( navigator.requestMIDIAccess){
			navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject);
		}
		// create local interface
		md = new MIDIinputobj(null);		// local
		md.setup(md.name);
		debugmsg("INIT Interface "+md.name+" "+md.index);
	
	}
}


function rpn()
{	this.values = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];

	this.low = function(chan, data)
	{
		this.values[chan] = data;
	}

	this.high = function(chan, data)
	{
		this.values[chan] |= 128*data;
	}

}

/////////////////////////////////////////
// class base
function MIDIfilter()
{	this.name = "";
	this.type = 0;
	this.filter_list = new objlist();
	this.interface = 0;		// index of MIDIobj (dev)

	this.filter = function(op, chan, arg, arg1, dev)
	{	let f = this.filter_list.head;

		while(f != null){
			if( f.ob != null && f.ob.filter(op,chan, arg,arg1, dev)){
				return true;
			}
			f = f.next;
		}

		return false;
	}

	this.print = function()
	{	let l = this.filter_list.head;
		let obj = null;
		debugmsg("___ filter "+this.name+" type="+this.type+" int="+this.interface);
		while(l != null){
			obj = l.ob;
			if( obj != null){
				obj.print();
			}
			l = l.next;
		}
		debugmsg("__ end filters");
	}
}


// 
// transport - provide a value that goes from 0-255 in a specified time/tempo
//

function UItransport(code)
{
	if( code == 0){
		g_transport.stop();

	}else if( code == 1){
		g_transport.pause();

	}else if( code == 2){

		g_transport.resume();
	}

}


function transport()
{
	this.clock = 0;
	this.clkstart = performance.now();
	this.running = 0;
	this.tempo = 0;
	this.value = 0;
	this.delta = 0.0;
	this.beats = 0;
	this.trigger = 0;
	this.name = "";
	this.mode = 0; 	// local, 1 global
	this.bar = 0;

	// called with current time in milliseconds
	this.run = function( now)
	{
		let millis = now - this.clkstart;
		this.clkstart = now;

		if( this.running == 0){
			return false;
		}
//		if( this != g_transport){		// do not check on the global transport
//			if(this.trigger > 2){		// missing too many ?
//				return false;
//			}
//		}
		if( isNaN(millis)){
			return false;
		}
		if( isNaN(this.value)){
			debugmsg("TRANS "+this.value+" "+this.delta+" "+millis);
			this.value = 0.0;
		}
		if( isNaN(this.delta)){
			this.delta = 1.0;
		}

		this.value += this.delta * millis;

//		debugmsg("run "+this.name+" "+this.running+" "+millis+" "+this.delta+" "+this.value);
		if( this.delta > 0){
			while( this.value >= 256){
				this.value -= 256;
				this.trigger++;
				this.bar++;
			}
		}else {
			while( this.value < 0 ){
				this.value += 256;
				this.trigger++;
				this.bar--;
				if( this.bar < 0){
					this.bar = 0;
				}
			}
		}
		return false;		// keep running.
	}

	// transport
	this.localStop = function()
	{
		this.trigger = 0;
		this.running = 0;
		this.value = 0;
		this.bar = 0;
	}

	this.stop = function()
	{
		if( this.mode == 1){
			this.checkGlobal();
			g_transport.mode = 0;
			g_transport.stop();
			return;
		}
		this.localStop();
	}

	this.localPause = function()
	{
		this.trigger = 0;
		this.running = 0;
	}

	this.pause = function()
	{
		if( this.mode == 1){
			this.checkGlobal();
			g_transport.mode = 0;
			g_transport.pause();
			return;
		}
		this.localPause();
	}

	this.localResume = function()
	{
		this.trigger = 0;
		this.running = 1;
	}


	this.resume = function()
	{
		if( this.mode == 1){
			this.checkGlobal();
			g_transport.mode = 0;
			g_transport.resume();
			return;
		}
		this.localResume();
	}

	this.checkGlobal = function()
	{	let f;
		if( g_transport == null){
			g_transport = new transport();
			g_transport.setTempo(240, 4);
			timer_list.addobj(g_transport, null);
			g_transport.name = "Global-transport";		// for debugging
					
			f = document.getElementById("transport_controls");
			if( f != null){
				f.style.display = "block";
			}
		}

	}

	this.getValue = function()
	{
		if( this.mode == 0){
			return this.value;
		}
		this.checkGlobal();
		g_transport.mode = 0;
		return g_transport.getValue();
	}

	// transport getBeat assumes 4 per bar. bar is 0 - 256 value.
	this.getBeat = function()
	{	let step;
		if( this.mode == 1){
			this.checkGlobal();
			g_transport.mode = 0;
			return g_transport.getBeat();
		}
		step = Math.floor(this.value / (256 / this.beats) );
//		debugmsg("Beat "+this.value+" "+step+" "+this.beats);
		return this.bar * this.beats + step;
	}

	this.timer = function()
	{
	
	}

	// transport
	this.setTempo = function(tempo, beats)
	{
		if( this.mode == 1){
			this.checkGlobal();
			g_transport.mode = 0;
			g_transport.setTempo(tempo, beats);
			return;
		}
		if( tempo <= 0){
			this.delta = 0.0;
		}else {
			if( beats <= 0){
				this.delta = 0.256 * tempo/60;
			}else {
				this.delta = (0.256 * tempo/60) / beats;
			}
		}
		this.tempo = tempo;
		this.beats = beats;
//	    debugmsg("Settempo "+tempo+" "+beats+" "+this.delta);
	}

	this.getTempo = function()
	{
		if( this.mode == 0){
			return this.tempo;
		}
		this.checkGlobal();
		g_transport.mode = 0;			// stop possible looping
		return g_transport.getTempo();

	}

	// called for a midi clock event
	this.midiclock = function()
	{
		this.clock++;
	}

	// transport 
	this.setData = function()
	{	let msg = "";
		let mmode = "Local";
		if(this.mode  == 1){
			mmode = "Global";
		}

		msg += "<table>\n";
		msg += "<tr><th>Mode</th><td><select id='transport_mode' onchange='UIrefresh(1, 0);' >";
		msg += "<option value='0' "+isSelected(0, this.mode)+" >Local</option>";
		msg += "<option value='1' "+isSelected(1, this.mode)+" >Global</option></select> </td></tr>\n";
		msg += "<tr><th>Tempo</th><td><input type='text' id='transport_tempo' value='"+this.getTempo()+"' size='4' onchange='UIrefresh(1, 0);'  /></td></tr>\n";
//		msg += "<tr><th>Delta</th><td>"+this.delta+"</td><th>trigger</th><td>"+this.trigger+"</td></tr>\n";
		msg += "</table>\n";

		return msg;
	}

	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let s = new saveargs();

		f = document.getElementById("transport_mode");
		if( f != null){
			s.addarg("transport_mode");
			s.addarg(f.value);
		}
		f = document.getElementById("transport_tempo");
		if( f != null){
			s.addarg("transport_tempo");
			s.addarg(f.value);
		}


		this.doLoad( s.getdata(), 0);
	}

	this.doLoad = function(initdata, idx)
	{	var len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";
        let tempo = this.tempo;

        for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
		    val = initdata[idx+n+1];
            if( param == "'control'"){
				continue;
			}else if( param == "transport_tempo"){
				if( val < 10){
					val = 10;
				}else if( val > 480){
					val = 480;
				}
				this.setTempo(val, this.beats);
			}else if( param == "transport_mode"){
				this.mode = val;
			}
		}
	}
}

///
// len, type, name, args
var midi_configs = [ 
	9, "interface", "Seaboard Block", "zone", 0, "chans", 15, "mpe", 1, 
	9, "interface", "Player", "zone", 0, "chans", 15, "mpe", 0, 
	0
];

// midi interface object wrapper. 

function MIDIobj(m)
{	this.midiport = m;		// midiport (id,name,type)
	this.name = "";
	this.portid = null;
	this.connected = true;

	if( m != null){ 
		this.portid = m.id;
		this.name = m.name;
	}
	
	this.print = function()
	{
		debugmsg("MIDI "+this.name);

	}
}


// input interface.
//
MIDIinputobj.prototype = Object.create(MIDIobj.prototype);
var nextMidiIndex = 0;

function MIDIinputobj(m)
{	MIDIobj.call(this, m);
	this.filter_list = new objlist();
	this.transport = null;
	this.status = 0;			// previous status value.
	this.rpn = null;			// registered param
	this.nrpn = null;			// non registered param
	this.mpe = 0;
	this.index = 0;

	// MIDIinputobj
	this.setup = function(name)
	{	let i,len,cnt;
		const config = midi_configs;
		let ng = null;
		inst = 0;

		cnt = 0;
		len = config[0];
		for(i= 0; len > 0 && i < config.length ; i += len){
			len = config[i];
			if( config[i+1] == "interface" && config[i+2] == name){
				// process info for interface
				debugmsg("interface "+name);
				if( ng == null){
					ng = new noteGroup(0);
					this.filter_list.addobj(ng, null);
					ng.interface = MIDIindev[this.index];
					ng.name = name;
				}
				cnt = 3;
				while(cnt < len){
					if( config[i+cnt] == "mpe"){
						this.mpe = config[i+cnt+1];
						if( this.mpe != 0){
							ng.ichannel = -1;	// MPE mode
							debugmsg("MPE mode");
						}
					}else if( config[i+cnt] == "zone"){
						ng.zone = config[i+cnt+1];
					}else if( config[i+cnt] == "chans"){
						ng.chans = config[i+cnt+1];
					}
					cnt += 2; 
				}
			}
		}
		if( ng != null){
			mg = new midiGroup(0, 1);
			mg.name = name;
			mg.midicnt = ng.index;
			ng.connect(mg);
			selMIDIindev(this.index);

			// create groups for poly
			if( ng.notes.length > 1){
				inst = 1;
				while( inst <= ng.notes.length){
					mg = new midiGroup(0, 1);
					mg.channel = inst;
					mg.name = name+"_"+inst;
					mg.midicnt = ng.index;
					ng.connect(mg);
		
					inst++;
				}
			}
		}
		
	}

	this.midiclock = function()
	{
		
	}

	// MIDIinputobj
	this.slowTimer = function(now)
	{	
	}

	// MIDIinputobj
	this.connect = function(obj)
	{	let f = null;
		debugmsg("I CONNECT ");
		this.filter_list.addobj(obj);
	}

	// MIDIinputobj
	this.disconnect = function(obj)
	{	debugmsg("I DISCONNECT ");
	
		MIDIremove(this.filter_list, obj);
		
	}

	this.print = function()
	{	let l = this.filter_list.head;
		debugmsg("__ "+this.name);

		while(l != null){
			if( l.ob != null){
				l.ob.print();
			}
			l = l.next;
		}
	}

	if( m != null){		// null is local ...
		MIDIindev_list.addobj(this, null);
		nextMidiIndex++;
		MIDIindev[nextMidiIndex] = this;
		this.index = nextMidiIndex;
	}else {
		this.index = 0;
		this.name = "Local";
		MIDIindev[0] = this;
	}

}


// output 
MIDIoutputobj.prototype = Object.create(MIDIobj.prototype);

function MIDIoutputobj(m)
{	MIDIobj.call(this, m);
	this.output = null;
	let mid;

	if( m != null){
		mid = m.id;
		this.output = midiAccess.outputs.get(mid);
	}

	MIDIoutdev_list.addobj(this, null);
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
	let inputs;
	let outputs;
	let md = null;
	let mp = null;

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
		if( o.name == name){
//			debugmsg("STATE found "+name);
			o.connected = connected;
			break;
		}

		l = l.next;
	}
	if( l == null){
		debugmsg("New midi "+name+" "+dir);
		if( dir == 1){
			inputs = midiAccess.inputs.values();
			for( indev = inputs.next(); indev && !indev.done; indev = inputs.next() ){
				mp = indev.value;
				if( mp.name == name){
					mp.onmidimessage = noMIDIMessageEventHandler;	// disable inputs
					md = new MIDIinputobj(mp);
					md.setup(md.name);
					debugmsg("Add new "+name);
				}
			}
		}else {
			outputs = midiAccess.outputs.values();
			for( indev = outputs.next(); indev && !indev.done; indev = outputs.next() ){
				mp = indev.value;
				if( mp.name == name){
					md = new MIDIoutputobj(mp);
					debugmsg("Add new output"+name);
				}
			}
		}
	}
}

function onMIDIInit(midi){
	let indev, odev;
	let inputs;
	let outputs;
	let md = null;
	let mp;	// midiport
	let cnt;

	midiAccess = midi;
	inputs = midiAccess.inputs.values();
	outputs = midiAccess.outputs.values();

	for( indev = inputs.next(); indev && !indev.done; indev = inputs.next() ){
		mp = indev.value;
		mp.onmidimessage = noMIDIMessageEventHandler;	// disable inputs
		md = new MIDIinputobj(mp);
		md.setup(md.name);
		debugmsg("INIT Interface "+md.name+" "+md.index);
	}

	cnt = 1;
	for( odev = outputs.next(); odev && !odev.done; odev = outputs.next() ){
		mp = odev.value;
		md = new MIDIoutputobj(mp);
		md.index = cnt;
		cnt++;
	}
	// selMIDIoutdev(0);		// local output
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
	if( MIDIindev[0] == null){
		return;
	}
	debugmsg("Local midi in");
	MIDIMessageEventHandler( e, 0);
}

function MIDIMessageEventHandler1( e){
//	debugmsg(printMidiEvent(e, 1));
	if( MIDIindev[1] == null){
		return;
	}
	MIDIMessageEventHandler( e, 1);
}

function MIDIMessageEventHandler2( e){
	if( MIDIindev[2] == null){
		return;
	}
	MIDIMessageEventHandler( e, 2);
}

function MIDIMessageEventHandler3( e){
	if( MIDIindev[3] == null){
		return;
	}
	MIDIMessageEventHandler( e, 3);
}

function MIDIMessageEventHandler4( e){
	if( MIDIindev[4] == null){
		return;
	}
	MIDIMessageEventHandler( e, 4);
}

function MIDIMessageEventHandler5( e){
	if( MIDIindev[5] == null){
		return;
	}
MIDIMessageEventHandler( e, 5);
}

function MIDIMessageEventHandler6( e){
	if( MIDIindev[6] == null){
		return;
	}
	MIDIMessageEventHandler( e, 6);
}

function MIDIMessageEventHandler7( e){
	if( MIDIindev[7] == null){
		return;
	}
	MIDIMessageEventHandler( e, 7);
}

function MIDIMessageEventHandler8( e){
	if( MIDIindev[8] == null){
		return;
	}
	MIDIMessageEventHandler( e, 8);
}

function MIDIMessageEventHandler9( e){
	if( MIDIindev[9] == null){
		return;
	}
	MIDIMessageEventHandler( e, 9);
}

function printMidiEvent( e, dev)
{
	let xdebugmsg = "";

	if( e.data.length > 2){
		xdebugmsg = "Min("+dev+")"+ashex(e.data[0])+" "+ashex(e.data[1])+" "+ashex(e.data[2]);
	}else if( e.data.length > 1){
		xdebugmsg = "Min("+dev+")"+ashex(e.data[0])+" "+ashex(e.data[1]);
	}else {
		xdebugmsg = "Min("+dev+")"+ashex(e.data[0]);
	}

	return xdebugmsg;
}

function MIDIMessageEventHandler( e, dev){
	const code = e.data[0] & 0xf0;
	const chan = e.data[0] & 0xf;
	let arg0, arg1, arg2, arg3;
	let pn;
	let md;
	let val;


	switch( code){
	case 0x90:
		if( e.data[2] != 0){
			arg0 = e.data[0];
			arg1 = e.data[1];
			arg2 = e.data[2];
			arg3 = 127;

			midiinsetvalues(1, chan, arg1, arg2, dev);
			return;
		}
		// note on with vel ==0 is a noteoff.
		arg0 = (chan ) | 0x80;
		arg1 = e.data[1];
		arg2 = 64;
		midiinsetvalues(0, chan, arg1, arg2, dev);
		return;

	case 0x80:
		arg0 = e.data[0];
		arg1 = e.data[1];
		arg2 = e.data[2];
		midiinsetvalues(0, chan, arg1, arg2, dev);
		return;

	case 0xa0:
		arg0 = e.data[0];
		arg1 = e.data[1];
		arg2 = e.data[2];
		midiinsetvalues(7, chan, arg1, arg2, dev);
		return;
	
	case 0xb0:		// control change
		arg0 = e.data[0];
		arg1 = e.data[1];
		arg2 = e.data[2];

		pn = arg1;
		md = MIDIindev[dev];
		val = arg2;

		if( arg1[1] >= 0x60){
			// rpn etc
			if( pn == 0x62){
				if( this.nrpn == null){
					this.nrpn = new rpn();
				}
				md.nrpn.low(chan, val);
			}else if( pn == 0x63){
				if( this.nrpn == null){
					this.nrpn = new rpn();
				}
				md.nrpn.high(chan, val);
			}else if( pn == 0x64){
				if( this.rpn == null){
					this.rpn = new rpn();
				}
				md.rpn.low(chan, val);
			}else if( pn == 0x65){
				if( this.rpn == null){
					this.rpn = new rpn();
				}
				md.rpn.high(chan, val);
			}else if( pn == 106 ){
				prognum = (prognum - 1) & 0x7f;
				arg0 = 0xc0 | chan;
				arg1 = prognum;
				if( e.data[2] == 127){
					midisetProgvalues(3, chan, arg0, arg1, dev);
				}
				return;
			}else if( pn == 107 ){
				prognum = (prognum + 1) & 0x7f;
				arg0 = 0xc0 | (chan);
				arg1 = prognum;
				if( e.data[2] == 127){
					midisetProgvalues(4, chan, arg0, arg1, 0, dev);
				}
				return;
			}
		}

//		debugmsg( printMidiEvent(e, dev));
		midiinsetvalues(2, chan, arg1, arg2, dev);

		return;

	case 0xc0:
		arg0 = e.data[0];
		arg1 = e.data[1];
		midiinsetvalues(8, chan, arg1, 0, dev);
		return;

	case 0xd0:
		arg0 = e.data[0];
		arg1 = e.data[1];
		midiinsetvalues(6, chan, arg1, 0, dev);
		return;

	case 0xe0:		// pitch bend
		arg0 = e.data[0];
		arg1 = e.data[1];
		arg2 = e.data[2];
		midiinsetvalues(5, chan, arg1, arg2, dev);

		return;

	case 0xf0:
		arg0 = e.data[0];
		// 
		if( arg0 == 0xf8 || arg0 == 0xfa || arg0 == 0xfb || arg0 == 0xfc ){
			doMidiClock(arg0, dev);
			softprogram.runProgram();
			return;
		}

	}
//	debugmsg( printMidiEvent(e, dev));
}


// process the midi events for note on/off and control change etc
function midiinsetvalues( op, chan, arg, arg2, dev)
{
	const md = MIDIindev[dev];
	let ng;

	if( md == null){
		return false;
	}

	// try the notegroups on the interface.
	ng = md.filter_list;
	if( ng != null){
		ng = md.filter_list.head;

		while(ng != null){
//			debugmsg("midiin try"+chan+" "+arg+" dev="+dev+" op="+op);
			if( ng.ob != null && ng.ob.filter(op, chan, arg, arg2, dev)){
				break;
			}
			ng = ng.next;
		}
	}

	 if( dev > 0 && calldepth == 0){
		calldepth++;
		softprogram.runProgram();
		calldepth--;
	 }
}


// process program change
function midisetProgvalues( op, chan, arg, arg2, dev)
{	let n = op;
	let f;
	const md = MIDIindev[dev];

	if( md == null){
		return false;
	}

	debugmsg("MIDI setprog"+chan+" "+arg);
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
				2,	0, "Power Off",		"End of a chain, optional.", 0x0001, "Power", 0, 1,	// 1
		"midigroup", "midi_group_in",	50, 50,	null, null ,null,  null, // 24
				0,	8, "midi_group_in",	"Midi Group Input filter",	 0x0000, "Action", 0, 0,	
		"midigroup", "midi_group_out",	50, 50,	null, null ,null,  null, // 24
				0,	9, "midi_group_out",	"Midi Group Output filter",	 0x0000, "Action", 0, 0,	
		"midicv", "midi_cc",	50, 50,	null, "actionout" ,null,  null, // 24
				5,	5, "midi_cc",	"Midi CV filter",	 0x0010, "Input", 0, 0,	
		"midicc", "midi_cv",	50, 50,	null, "actionout" ,null,  null,		// 		images for cv and cc reversed.
				4,	4, "midi_cv",	"Midi Note filter",	 0x0010, "Input", 0, 0,	
		"midicv", "midi_ccout",	50, 50,	"actionin" ,"actionout","logicin",  null, // 24
				7,	7, "midi_ccout",	"Midi CV output",	 0x0111, "Output", 0, 0,	
		"midicc", "midi_cvout",	50, 50,	"actionin" ,"actionout", "logicin",  null,		// 		images for cv and cc reversed.
				6,	6, "midi_cvout",	"Midi Note output",	 0x0111, "Output", 0, 0,	

		"midiclk", "midi_clk",	50, 50,	"actionin", "actionout" ,null,  null, // 24
				8,	10, "midi_clk",	"Midi Clock",	 0x0011, "Input", 0, 0,	
		"notegroup", "notegroup",	50, 50,	null, null ,null,  null, // 24
				0,	11, "note_group",	"Note Group filter",	 0x0000, "Action", 0, 0,	
		"splitter", "splitgroup",	50, 50,	null, null ,null,  null, // 24
				0,	12, "splitter_group",	"Splitter Group filter",	 0x0000, "Action", 0, 0,	
		"target", "targetgroup",	50, 50,	null, null ,null,  null, // 24
				0,	13, "Learn Targets",	"Learn Target filter",	 0x0000, "Action", 0, 0,	

		"", "midiplayer",	400, 400,	"actionin", "actionout" ,null,  null, 				// 25	
			11,	14, "midi_player",	"Midi file player",	 0x0011, "Action", 0, 0,	

		null, null, null, null,				null, null, null, null
	];

	this.ctrltab = [

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
		"notegroup", 0xd,
		"splitter", 0xd,
		"target", 0xd,
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
		let name = this.bitnames[ bit.btype+1];
		let ctrl = this.bitnames[ bit.btype+9];

		if( ctrl == 0){
			for(i=0; this.ctrltab[i] != null; i += this.ctrltab[i+1]){
				if( this.ctrltab[i] == name){
					// found control
					ctrl = this.ctrltab[i+2];
					break;
				}
			}
		}

		if( ctrl == 4){
			// note filter
			ct = new midiCVBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 5){
			// Control Cond filter
			ct = new midiCCBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 6){
			// note output
			ct = new midiCVOutBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 7){
			// Control Cond output
			ct = new midiCCOutBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 8){
			// Group filter
			ct = new midiGroupBit( bit);
			bit.ctrl = ct;
			ct.grouptype = 1;
			ct.groupname = "Default Input";
			ct.setData();
			return ct;
		}else if( ctrl == 9){
			// Group filter
			ct = new midiGroupBit( bit);
			bit.ctrl = ct;
			ct.grouptype = 0;
			ct.groupname = "Default Output";
			ct.setData();
			return ct;
		}else if( ctrl == 10){
			// Clock filter
			ct = new midiClockBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 11){
			// notegroup
			ct = new noteGroupBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 12){
			// splitter
			ct = new splitGroupBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 13){
			// Learn target		manage targets
			ct = new targetGroupBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 14){
			// Midi file player - a midi interface.
			ct = new playerBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
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
		this.print();
	}

	this.print = function()
	{	let i;
		let md;

		debugmsg("Interfaces "+MIDIindev.length);
		for(i=0; i < MIDIindev.length; i++){
			if(MIDIindev[i] != null){
				md = MIDIindev[i];
				md.print();
			}
		}
		debugmsg("End Interfaces");

	}



}

//
function note()
{
	this.note = 0;
	this.chan = 0;

}

// notegroups are used by midi groups
//
noteGroup.prototype = Object.create( MIDIfilter.prototype);

function noteGroup(idx)
{	MIDIfilter.call(null);
	this.name = "Notegroup";
	this.notemode = 0;	// round robin
	this.ichannel = 0;		// input channel. 0 omni, -1 mpe
	this.channel = 1;		// output channel.
	this.notes = [null, null, null ];
	this.last = 0;
	this.notecnt = 3;
	this.zone = 0;		// mpe zone
	this.chans = 0;		// mpe channels
	this.parent = null;	
	this.interface = null;
	this.notefilters = new objlist();
	this.ccfilters = new objlist();

	///////////////////////////////////////////
	this.noteon = function(op, chan, arg, arg2, dev)
	{	let nl = null;
		let n = chan;
	
		nl = this.notefilters.head;
//		debugmsg("ON "+n+" "+chan+" "+arg);
	
		if( this.notes[n].note == arg){
			debugmsg("Ignore on "+n+" "+arg);
			return;
		}
		if( this.notes[n].note != 0){
//			debugmsg("STEAL "+n+" "+this.notes[n].note+" "+arg);
			this.noteoff(0, chan, this.notes[n].note, arg2, dev);
		}
		// send on nth filter
		while(nl != null){
			if( nl.ob != null && nl.ob.filter(1, chan, arg, arg2, dev)){
				break;
			}
			nl = nl.next;
		}
		this.notes[n].note = arg;
	}

	this.noteoff = function(op, chan, arg, arg2, dev)
	{	let nl = null;
		let n = chan;
	
		nl = this.notefilters.head;
	
		while(nl != null){
			if(	nl.ob != null && nl.ob.filter(op, chan, arg, arg2, dev)){
				break;
			}
			nl = nl.next;
		}
		this.notes[n].note = 0;
	}

	this.alloff = function()
	{
		let n = 0; 
		for(n=0; n < this.notes.length; n++){
			this.noteoff(0, n, this.notes[n].note, 0, 1);
		}
	}

	// process op = 2,5,6,7   change, pressure, aftertouch, pitchbend
	this.cc = function(op, chan, arg, arg2, dev)
	{	let nl = null;
		
		nl = this.ccfilters.head;
	
		while(nl != null){
			if( nl.ob != null && nl.ob.filter(op, chan, arg, arg2, dev)){
				return true;
			}
			nl = nl.next;
		}
		return false;
	}

	// process note data from upstream interface.
	// notegroup
	this.filter = function(op, chan, arg, arg2, dev)
	{	
		let n = 0;
		let len = 0;

		len = this.notes.length;

		if( this.ichannel > 0 && this.ichannel != (chan +1)){
			// channel mismatch.
			return false;
		}
//		if( this.notefilters != null && this.notefilters.head != null){
//			// have a listener
//			debugmsg("NGFilt "+this.name+" "+op+" "+chan+" "+arg+" ichan="+this.ichannel);
//		}

		// notemode 0: round robin
		// notemode 1: unison, send note to all listeners.
		dev = this.index;

		if( op ==1){
			if( this.notemode == 0){
				// note on. look for free channel
				for(n = 0; n < len; n++){
					if( this.notes[n] == null){
						this.notes[n] = new note();
						break;
					}
					if( this.notes[n].note == 0){
						break;	// found free
					}
				}
				if( n >= this.notes.length || n >= this.notecnt){
					// take one.
					this.last++;
					if( this.last >= this.notecnt){
						this.last = 0;
					}
					n = this.last;
				}else {
					this.last = n;		// most recent
				}

				// use note n
				this.notes[n].chan = chan+1;		// so we can map channel info.
				this.noteon(op, n, arg,arg2, dev);
			}else if( this.notemode == 1){
				// unison
				for(n=0; n < this.notes.length; n++){
//					debugmsg("unison "+arg+" "+this.notes[n]);
					this.notes[n].chan = chan+1;		// so we can map channel info.
					this.noteon(op, n, arg, arg2, dev);
				}
			}
		}else if( op == 0){
			// noteoff
			for(n = 0; n < this.notes.length; n++){
				if( this.notes[n] == null){
					this.notes[n] = new note();
				}
				if( this.notes[n].note == arg){
					this.noteoff(op, n, arg, arg2, dev);
					this.notes[n].chan = 0;
				}
			}
		}else {			// 2,5,6,7
			// find a note that is in the same channel and then map it.
			for(n = 0; n < this.notes.length; n++){
				if( this.notes[n] != null){
//					debugmsg("NGcc "+n+" "+this.notes[n].chan+" "+(chan+1)+" op="+op );
					if( this.notes[n].chan == chan+1){
						// remap it.
						if( this.cc(op, n, arg, arg2, dev)){
							break;
						}
					}
				}
			}
		}
		return false;
	}

	// notegroup
	this.connect_cv = function(obj, chan)
	{
		debugmsg("NG CONNECT ");
		this.notefilters.addobj(obj, null);
	}

	// notegroup
	this.connect_cc = function(obj)
	{
		debugmsg("NG CONNECT CC");
		this.ccfilters.addobj(obj, null);
	}

	// notegroup
	this.disconnect_cv = function(obj)
	{
		debugmsg("NG DISCONNECT ");
		MIDIremove(this.notefilters, obj );		
	}

	// notegroup
	this.disconnect_cc = function(obj)
	{
		debugmsg("NG DISCONNECT CC ");

		MIDIremove(this.ccfilters, obj );		

	}


	// notegroup
	this.connect = function(obj)
	{
		debugmsg("NG CONNECT gen");
		this.notefilters.addobj(obj, null);
		this.ccfilters.addobj(obj, null);

	}

	// notegroup
	this.disconnect = function(obj)
	{
		debugmsg("NG DISCONNECT gen");
	
		MIDIremove(this.notefilters, obj );		
		MIDIremove(this.ccfilters, obj );		
	}

	this.print = function()
	{	let l = this.notefilters.head;
		debugmsg("Notegroup "+this.name);

		while(l != null){
			l.ob.print();
			l = l.next;
		}
		l = this.ccfilters.head;
		while(l != null){
			l.ob.print();
			l = l.next;
		}
	}

	this.onRemove = function()
	{	let l = this.notefilters.head;
		let lnext;
		let f;
	
		debugmsg("NG onremove "+this.name);
		while(l != null){
			lnext = l.next;
			f = l.ob;
			this.disconnect(l.ob);
			f.onRemove();
			l = lnext;
		}
		// remove from notegrouplist
		l = noteGroups_list.head;
		while(l != null){
			if( l.ob == this){
				noteGroups_list.removeobj(l);
				break;
			}
			l = l.next;
		}
	}

	if( idx == 0){
		nextgroup++;
		idx = nextgroup;
		this.index = idx;
	}
	noteGroups_list.addobj(this, null);
}

addkit( new kit_midi() );
new postkitload("Midi");

/////////////////////////////////////////////////////////////
