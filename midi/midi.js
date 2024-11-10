///////////////////////////////////////////////////////////////
// web midi interface
// midi.js

var outputlist = null;
var midiAccess = null;
var useMIDIin = null;
var useMIDIout = null;
var chosenOutput = 0;
var midiintarget = null;

MIDIoutdev_list = new objlist();
MIDIindev_list = new objlist();


/////////////////////////////////////////////////////////////////////

timer_list.addobj( new midi_process(), null);

function midi_process()
{

	this.timer = function()
	{	var d;

		if( navigator.requestMIDIAccess){
			navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject);
		}

		return true;			// only used once
	}
}


function UIselMIDIindev()
{	var m = document.getElementById('midiinsel');
	var l = MIDIindev_list.head;

	if( useMIDIin != null){
		useMIDIin.midi.value.onmidimessage = noMIDIMessageEventHandler;
	}

	useMIDIin = null;
	while(m.value != 0 && l != null){
		if( l.ob.count == m.value){
			useMIDIin = l.ob;
			useMIDIin.midi.value.onmidimessage = MIDIMessageEventHandler;
			l = null;
		}else {
			l = l.next;
		}
	}

}


//////////////////////////////////////////////////////////////////////////////

function UIselMIDIoutdev(){
	var m = document.getElementById('midioutsel');
	var l = MIDIoutdev_list.head;

	useMIDIout = null;
	while(m.value != 0 && l != null){
		if( l.ob.count == m.value){
			useMIDIout = l.ob;
			l = null;
		}else {
			l = l.next;
		}
	}
	chosenOutput = m.value;
	m = document.getElementById('loadform');
	if( m != null){
		m.chosenoutput.value = chosenOutput;
	}

//	xdebugmsg ="chosenOutput="+chosenOutput;

}

function showMIDIinterfaces(inout)
{
	let msg="";
	let m;
	let l;
	let cnt = 1;

	if( inout == 1){	// inputs
		l = MIDIindev_list.head;

		msg += "<select id='midiinsel' onchange='UIselMIDIindev();' >\n";
		msg += "<option value='0'>Keyboard</option>\n";

		while(l != null){
			l.ob.count = cnt;
			msg += "<option value='"+cnt+"' >"+l.ob.midi.value.name+"</option>";
			cnt++;
			l = l.next;
		}
		msg += "</select>\n";
		return msg;
	}

	if( inout == 0){
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

		return msg;
	}
	return "Error";

}

////////////////////////////////////////////////////////////////////////////

function MIDIobj(m)
{	this.midi = m;
	this.count = 0;

}

function onMIDIInit(midi){
	let indev, odev;
	let inputs;
	let outputs;

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

//	showMIDIinterfaces();

}

function onMIDIReject(err){
	alert("Failed to init MIDI");
}

function noMIDIMessageEventHandler( e){
}

var prognum = 0;

function midiinsetvalues( arg, chan, val)
{	var scene = null;
	var sl = scene_list.head;		// search the scenes
	var cl;
	while(sl != null){

		l = sl.ob.controllerlist.head;
		while(l != null){
			cl = l.ob.ctrllist.head;
			while(cl != null){
				if( cl.ob.target == "midiinput")
				{	
					cl.ob.setvalues( arg, chan, val);
					cl = null;
				}else {
					cl = cl.next;
				}
			}
			l = l.next;
		}
		sl = sl.next;
	}
}

var laststatus = 0;

function ashex(n)
{	var n2;
	var hexdigits="0123456789abcdef";
		
	n2 = Math.floor( (n & 0xf0) / 16);

	return hexdigits.charAt(n2)+hexdigits.charAt( n & 0x0f);
}



function MIDIMessageEventHandler( e){
	var code = e.data[0] & 0xf0;
	var msg;
	var msg3=[0, 0, 0];
	var msg2= [0, 0];

	xdebugmsg = "Min "+ashex(e.data[0])+" "+ashex(e.data[1])+" "+ashex(e.data[2]);
	showdebug();

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


//////////////////////////////////////////////////////////////////

function showPlayButton()
{ var b = document.getElementById('playbutton');
  var b1 = document.getElementById('stopbutton');

  if( b != null){
	  b.style.display="inline";
	b1.style.display="none";
  }
}

function showStopButton()
{ var b = document.getElementById('playbutton');
  var b1 = document.getElementById('stopbutton');

  b1.style.display="inline";
  b.style.display="none";

}

///////////////////////////////////////////////////////////////////

object_list.addobj( new objfactory("midiout", midioutobj) );

midioutobj.prototype = Object.create(sceneObject.prototype);

function midioutobj( ctx, parent, x, y, w, h )
{	sceneObject.call(this, ctx, x, y, w, h );
	this.scene = parent;

	// 
	this.setvalues = function(arg, chan, val)
	{
//	xdebugmsg2 = "midiout "+arg;
		if( useMIDIout != null){
			if( arg == "programchange"){
				useMIDIout.midi.value.send( val);
			}else {
				useMIDIout.midi.value.send( val);
			}
		}
		if( this.linked != null && !this.marked){
			this.marked = true;
			this.linked.setvalues(arg, chan, val);
			this.marked = false;
		}
	}

	this.save = function()
	{	var attrs = this.saveattrs();
		var lattrs= this.savelocal();
		return '"midiout", '+this.savepos()+(attrs[0]+lattrs[0])+", "+attrs[1]+lattrs[1]+"\n";
	}

}

object_list.addobj( new objfactory("midiin", midiinobj) );

midiinobj.prototype = Object.create(sceneObject.prototype);

function midiinobj( ctx, parent, x, y, w, h )
{	sceneObject.call(this, ctx, x, y, w, h );
	this.scene = parent;

	this.setvalue = function(arg, val)
	{
		this.dosetvalues(arg, 0, val);
	}

	this.setvalues = function(arg, chan, val)
	{
		this.dosetvalues(arg, chan, val);
	}

	this.save = function()
	{	var attrs = this.saveattrs();
		var lattrs= this.savelocal();
		return '"midiin", '+this.savepos()+(attrs[0]+lattrs[0])+", "+attrs[1]+lattrs[1]+"\n";
	}

}

