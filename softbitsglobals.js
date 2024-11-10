//////////////////////////////////////////////////////////////////////////////
/// SoftBitsLive global variables and tables.
///    data output functions.
//
//////////////////////////////////////////////////////////////////////////////
//
var sketch;
var ctx;
var mx, my;
var sx = 0;
var sy = 0;	// when dragging background
var dx, dy;	// offsets into object being dragged.
var background;
var bitpics = new Array();
var bitpicnames = new Array();
var selected = null;	// the object selected.
var tick = 0;		// used by animate
var drawing = 0;
var scanning = null; // snap that is 'scanning'
var repel = 0;				// cannot dock with target..
var docktarget = null;	 // the target
var modified = 0;			// made a significant change.
var dragging = null;
var logger=null;
var docking = null;	// bit that we are docking
var dockX;
var dockY;
var bitform = null;
var bitformaction = null;		// what to do with the form data..
var displaying = null;
var startX, startY;
var softprogram = null;		// program instance for web
var curctrl = null;			// currently selected control.
var autosel = null;			// autoselect snap by motion..
var autox, autoy;
var piano = null;
var curnote = 0;
var curprog = null;
var arduino = null;			// The arduino bit that handles the web -> arduino -> web comms.
var valueslist = null;		// list of bits that have values to send to the arduino such as dimmer or piano ?
var seqh = 0;
var seql = 0;
var seqmissmatch = 0;

var showchains = 1;
var showprogram= 1;
var showcode = 1;

var canNetwork = 1;

// audio stuff
var context = null;

// module/kit list
var kitlist = null;
var bitlistmenu = null;
var domainlist = null;		// list of domains.
var loading_kit = null;
var loadstate = 0;
var curkit = null;
var curkitname = "Basic";
var curbittype = "";
var curbitcolor = "grey";

// 5/4/2015
var forth = null;

// from midi/processbase
var timerval= 20;
var timer_list = new objlist();
var scene_list = new objlist();
var animation_list = new objlist();

// debug messages
var debug = null;

////////////////////////////////////////////////////////////////
// link list of objects
//

function obj(list, ob, data)
{	this.next = null;
	this.prev = null;
	this.ob = ob;
	this.data = data;
	this.list = list;

}



function objlist()
{	this.head = null;

	this.addobj = function( ob, data)
	{	var o = new obj(this, ob, data);

		o.next = this.head;
		if( this.head != null){
			o.next.prev = o;
		}
		this.head = o;
//		alert("Addobj");

		return o;
	}

	this.adduniq = function( ob, data)
	{	let t = this.head;
		let o;
		
		if( t == null){
			return this.addobj(ob, data);
		}

		while( t != null){
			if( t.ob == ob){
				return t;		// found it
			}
			t = t.next;
		}

		return this.addobj(ob, data);
	}

	this.removeobj = function( ob)
	{	let xdebugmsg="";
		if( ob.list != this){
			xdebugmsg = "REMOVE list not this";
			debugmsg(xdebugmsg);
			return;
		}

		// remove from list;
		if( ob.prev != null){
			ob.prev.next = ob.next;
		}
		if( ob.next != null){
			ob.next.prev = ob.prev;
		}
		// see if this is the head one.
		if( ob == this.head){
			this.head = ob.next;
		}
	}

	this.reverse = function()
	{	let t,t2;

		if( this.head == null){
			return;
		}
		t = this.head;
		this.head = null;

		while( t != null){
			t2 = t.next;
			t.next = this.head;
			t.prev = null;
			this.head = t;
			if( t.next != null){
				t.next.prev = t;
			}
			t = t2;
		}
	}
}

////////////////////////
// dynamicall add bitnames
var bitnames = [
	"poweron", "power_on", 50, 50,		null, "powerout", null, null,		
	"poweroff", "power_off", 50, 50,	"powerin", null, null, null,
	null, null, null, null,				null, null, null, null
];

var ctrltab = [
	//  ID, len, args
		0, 0, 0, 0, 0	// end of table
	];
	
// x, y, w, h
var tilemap = [
	0, 0, 0, 0
];

var powerColors = [
 "#000000",
 "#0000ff",
 "#f0f000",
 "#00ff00",
 "#ff0000",
 "#00f0f0",
 "#f000f0",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff",
 "#ffffff"
 ];


 ////////////////////////// base64 conversions
 ///

var base64tab ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function base64Encode( datain )
{	var output = "";
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var i = 0;

 
	while (i < datain.length) {
 
		chr1 = datain[i++];
		chr2 = datain[i++];
		chr3 = datain[i++];
 
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
 
		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}
 
		output = output +
		base64tab.charAt(enc1) + base64tab.charAt(enc2) +
		base64tab.charAt(enc3) + base64tab.charAt(enc4);
 
	}
	return output;
}

function base64Decode( datain)
{
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;
 
	input = datain.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
	while (i < input.length) {
 
		enc1 = base64tab.indexOf(input.charAt(i++));
		enc2 = base64tab.indexOf(input.charAt(i++));
		enc3 = base64tab.indexOf(input.charAt(i++));
		enc4 = base64tab.indexOf(input.charAt(i++));
 
		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
 
		output = output + String.fromCharCode(chr1);
 
		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}
 
	}
 
	return output;
 }

function hexCode(code)
{	var msg;
	var r = code & 15;
	var b = code - r;

	var hex=["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
		
	msg = hex[ b / 16] + hex[ r] + " ";

	return msg;
}

//////////////////////////////////////////////////////////////////
///
/// global functions that interface with the html
///

function outData(u8data)
{
	if( arduino == null){
//		message("No Connection");
		return;
	}
	arduino.outData( u8data);
}

function outCC( code, val)
{	var u8data = new Uint8Array(3 );
	u8data[0] = 0xb0;
	u8data[1] = code;
	u8data[2] = val;

	outData(u8data);
}


function outCode( code, len)
{	var hdrlen = 8;
	var u8data = new Uint8Array(len + hdrlen + 1 );
	var i = 0;

	// update the sequence number avoiding 0,0 etc.
	seql++;
	if( seql > 127){
		seql = 1;
		seqh++;
		if( seqh > 127){
			seqh = 1;
		}
	}

	u8data[0] = 0xf0;
	u8data[1] = 0x53;	// S
	u8data[2] = 0x42;	// B
	u8data[3] = 0x4c;	// L
	u8data[4] = 1;
	u8data[5] = seqh;
	u8data[6] = seql;
	u8data[7] = 1;

	for(i=0; i < len;i++){
		u8data[i+hdrlen] = code[i];
	}

	u8data[i + hdrlen] = 0xf7;

	outData( u8data);
}

function noteOn( note, vel){
	var u8data = new Uint8Array(3 );
	u8data[0] = 0x90;
	u8data[1] = note;
	u8data[2] = vel;

	outData(u8data);
}


// output the values from the wire send
// 2 bytes (14 bits) send channel
// 2 bytes (14bits) value
function outBitValues()
{	var i;
	var n,d;


	if( arduino != null && arduino.senddata != null){
		arduino.senddata[5] = seqh;	// make sure seq numbers are up todate
		arduino.senddata[6] = seql;
		
		for(i = 8; i < arduino.senddata.length; i+= 4){
			n = arduino.senddata[i];
			n = n | ( arduino.senddata[i+1] * 128);
			d = arduino.senddata[i+2] ;
			d = d | (arduino.senddata[i+3] * 128);

			if( n >=0 && n < arduino.senddata.length){
				softprogram.prevdata[n] = d;
				// message("PREV "+n+" "+d);
			}
		}
		outData( arduino.senddata);
		arduino.senddata = null;
	}
}


function UIdoSave()
{	let msg = "";
	let bl = sketch.blist;
	let bit;
	var bt;
	var idx;
	var i;
	let msg2="";
	let slen = 4;
	let ckit = "";

	// number the list
	idx = 1;
	bl = sketch.blist;
	while(bl != null){
		bl.num = idx++;
		bl = bl.next;
	}

	bl = sketch.blist;
	while(bl != null){
		bit = bl.bit;
		if( bit.kit.name != ckit){
			msg += "'kit','"+bit.kit.name+"',\n";
			ckit = bit.kit.name;
		}
		slen = bit.snaps.length;
		bt = bit.btype & 7;
		idx = bit.btype - bt;
		msg += "'bit',"+bl.num+",'"+bit.name+"',"+bit.btype+','+bit.x+","+bit.y+",";
		for(i=0; i < slen; i++){
			if( bit.snaps[i] != null && bit.snaps[i].paired != null){
				msg += bit.snaps[i].paired.bit.carrier.num;
			}else {
				msg += "0";
			}
			msg += ",";
		}
		if( bit.ctrl != null){
			msg += "  "+bit.ctrl.doSave();
		}else {
			msg += "  1,";
		}
		msg += "\n";

		bl = bl.next;
	}
//	message(msg);

	msg += "'options',"+showchains+","+showprogram+","+showcode+", 1, \n"

	f = document.getElementById('savedata');
	f.innerHTML=msg;

	f = document.getElementById('saveform');
	f.submit();
	modified = 0;
}


function UIdoLoad()
{	var msg = "";


	if( bitform != null){
		doBitFormAction();
	}
    bitform = document.getElementById("bitform");
	if( bitform != null){

		bitform.method="post";
		bitform.action="softbitslive.php";
		bitform.enctype='multipart/form-data';

		msg = "<div style='padding:10px;border-style:solid;border-width:2px;border-color:blue;'>\n";
		msg += "<table><tr><td>\n";
		msg += "<input type='file' name='loadfilename' id='loadfilename' accept='.sbl'/><br />\n";
		msg += "</td></tr>\n<tr><td>\n";
		msg += "<input type='submit' name='action' value='Load'  />\n";
		msg += "</td></tr>\n";
		msg += "</table>\n";
		msg += "</div>\n";

		bitform.innerHTML = msg;
		clearbitform = 1;
	}
}

function UIdoShowChains()
{ var x = document.getElementById("showchains");

	if( x.checked ){
		showchains = 1;
	}else {
		showchains = 0;
	}
	sketch.drawProgram();
}

function UIdoShowProgram()
{
 var x = document.getElementById("showprogram");

	if( x.checked ){
		showprogram = 1;
	}else {
		showprogram = 0;
	}
	sketch.drawProgram();
}

function UIdoShowCode()
{ var x = document.getElementById("showcode");

	if( x.checked ){
		showcode = 1;
	}else {
		showcode = 0;
	}
	sketch.drawProgram();
}

function doNewAction()
{
	loadInitData(initdataonReset);
}

function doNew()
{	var msg = "";


	if( bitform != null){
		doBitFormAction();
	}
    bitform = document.getElementById("bitform");
	if( bitform != null){

		bitform.method="get";
		bitform.action="softbitslive.php";
		bitform.enctype='multipart/form-data';

		msg = "<div style='padding:10px;border-style:solid;border-width:2px;border-color:blue;'>\n";
		msg += "<table><tr><td>\n";
		if( modified != 0){
			msg += "Are you sure you want to discard changes? ";
		}else {
			msg += "Press button to reset. ";
		}
		msg += "<input type='button' name='action' value='Ok'  onclick='doNewAction()'/>\n";
		msg += "</td></tr>\n";
		msg += "</table>\n";
		msg += "</div>\n";

		bitform.innerHTML = msg;
		clearbitform = 1;
	}
}


function doReloadAction()
{	
	loadInitData(initdataonLoad);
}

function doReload()
{	var msg = "";


	if( bitform != null){
		doBitFormAction();
	}
    bitform = document.getElementById("bitform");
	if( bitform != null){

		bitform.method="get";
		bitform.action="softbitslive.php";
		bitform.enctype='multipart/form-data';

		msg = "<div style='padding:10px;border-style:solid;border-width:2px;border-color:blue;'>\n";
		msg += "<table><tr><td>\n";
		if( modified != 0){
			msg += "Are you sure you want to discard changes? ";
		}else {
			msg += "Press button to reload. ";
		}
		msg += "<input type='button' name='action' value='Ok'  onclick='doReloadAction()'/>\n";
		msg += "</td></tr>\n";
		msg += "</table>\n";
		msg += "</div>\n";

		bitform.innerHTML = msg;
		clearbitform = 1;
	}
}

function findimage(name){
	let i = 0;

	for(i=0; i < bitpicnames.length; i++){
		if( bitpicnames[i] == name){
//	debugmsg("Find "+name+"="+i);
			return i;
		}
	}
//	debugmsg("Find "+name+" not found i="+i);
	return null;
}

function loadimage(name, dst, imagedir)
{
	bitpics[ dst ] = new Image();
	bitpics[ dst ].src = imagedir+name+".png";
	bitpicnames[dst] = name;
}

////////////////////////////////////////////////////////////////////////
// define module  - kit of parts
//
function sbmodule( name )
{	this.name = name;
	this.bitnames = null;
	this.next = null;
	this.prev = null;
	this.bitstart = 0;

	this.ctrltab = [
	//  Name, len, args
		null, 0, 0, 0, 0	// end of table
	];

	this.ctrlcodes = [
		"power_on", 0,
		"power_off", 2,
	];


	this.findkitcode = function(name)
	{	let n = 0;
		for(n=0; n < this.kitctrlcodes.length; n = n+2){
			if( name == this.kitctrlcodes[n]){
				message("Kitcode: "+n+" "+name);
				return this.kitctrlcodes[n+1];
			}
		}
		message("Kitcode: not found "+name);
		return 254;
	}


	this.findcode = function(name)
	{	let n=0;

		n = this.findkitcode(name);
		if( n != 255){
			return n;
		}

		for(n=0; n < this.ctrlcodes.length; n += 2)
		{	if(this.ctrlcodes[n] == name){
				return this.ctrlcodes[n+1];
			}
			debugmsg( "Code: "+name+" notfound");
		}
		return 255;
	}

	this.getdomain = function(name)
	{
		debugmsg("getdomain "+name);
		return 0;
	}


	this.loadimages = function()
	{	let i,n;
		let imagedir="";
		let dst = bitpics.length;
		this.bitstart = dst;
		let name="";

		i = 0;
//		debugmsg("Load images "+this.name);

		while( this.bitimagemap[i] != null){
			name = this.bitimagemap[i];
			if( findimage(name) == null){
				if( this.bitimagemap[i+1] == 0){
					imagedir="snaps/";
				}else if(this.bitimagemap[i+1] == 1) {
					imagedir="bits/";
				}else if(this.bitimagemap[i+1] == 2) {
					imagedir="resources/images/";
				}else {
					imagedir= "";
				}
			
				loadimage(name, dst, imagedir);
				dst = dst+1;
			}
			i += 2;
		}

		debugmsg("Load "+imagedir+this.bitimagemap[i]+" "+dst);

		flipimg = findimage("flip");
		flipvimg = findimage("flip-v");
		removeimg = findimage("remove");
		knobimg = findimage("knob");
		knobvimg = findimage("knob-v");
		wirelinimg = findimage("wirein-l");
		wiretinimg = findimage("wirein-t");
		wireroutimg = findimage("wireout-r");
		wireboutimg = findimage("wireout-b");
		defaultimg = findimage("default");
		seqimg = findimage("seq");
	}

// sbmodule.addctrl

	this.addCtrl = function( bit)
	{
		return null;
	}

	// add the bits in this kit to the global bit list.
	this.loadBits = function()
	{
		let n = 0;
		let i = 0;

		for(i=0; i < this.bitnames.length; i+= 16){
			debugmsg("loadBits "+ this.bitnames[i+1]);
		}
	}

	this.init = function()
	{
		this.loadimages();
		debugmsg("Init kit "+this.name+" dst="+this.bitstart);
	}

	// per kit domain bits. can be dynamic
	this.getdomain = function()
	{
		return 0;
	}

	this.selected = function()
	{
		if( bitform != null){
			bitform.innerHTML="";
		}
	}
}

function addkit( sbmod)
{	var t;

	t = kitlist;
	if( kitlist == null){
		kitlist = sbmod;
		return sbmod;
	}

	while( t.next != null){
		t = t.next;
	}
	sbmod.prev = t;
	t.next = sbmod;

	return sbmod;
}


// find kit
// look for a loaded kit.
// if the kit is not found, try and load it from the server.
//


function findkit( name)
{	var t;
	var xmlhttp;

	t = kitlist;

	while(t != null)
	{
		if( t.name == name){
			return t;
		}
		t = t.next;
	}
	// fetchkit(name);

	return null;
}

//var timerlock = 0;
var joblist = null;

function scheduler()
{	this.next = null;
	this.prev = null;
	this.done = false;
	this.name = "";

//	timerlock++;

	this.next = joblist;
	if( joblist != null){
		joblist.prev = this;
	}

	joblist = this;

//	timerlock--;

	this.run = function()
	{
		this.done = true;
	}

	this.delete = function()
	{
//		timerlock++;
		this.done = true;
		// alert("Scheduler delete "+this.name);
		return;

		if( joblist == this){
			if( joblist.next != null){
				joblist.next.prev = null;
			}
			joblist = joblist.next;
		}else {
			if( this.prev != null){
				this.prev.next = this.next;
			}
			if( this.next != null){
				this.next.prev = this.prev;
			}
		}
		this.next = null;
		this.prev = null;

//		timerlock--;
	}
}


postkitload.prototype = Object.create( scheduler.prototype);

function postkitload(name)
{
	scheduler.call(this);

	this.name = name;

	this.run = function()
	{	var k;
		var i;
		var m;
		let name = this.name;
		this.done = true;

		
		if( loading_kit == null){
			k = findkit(name);
			if(k != null){

//				k.loadBits();

				// alert("Postkitload loadimages "+this.name);
				k.loadimages();
//				k.loadmenu();

				// alert("Postkitload found="+this.name);
				this.delete();
				return;
			}
			message("Failed to load "+name+" kit.");
			this.delete();
		}
	}

}




