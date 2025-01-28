// 11/16/24
// 1/20/25
///////////////////////////////////////////////////////////////////////////
var flipimg = 0;
var flipvimg = 0;
var removeimg = 0;
var knobimg = 0;
var knobvimg = 0;
var wirelinimg = 0;
var wiretinimg = 0;
var wireroutimg = 0;
var wireboutimg = 0;
var audiolinimg = 0;
var audiotinimg = 0;
var audioroutimg = 0;
var audioboutimg = 0;
var defaultimg = 0;
var seqimg = 0;
const none = null;
var trace = 0;
var getimagemap = false;
// 10/27/24
var activedomains = 1;		// which domains are active  1 == basic, 2 = sound, 4 = midi
var hidetouch = true;		
var curtab = "progtab";
// 11/29/24
var execmode = 0;
var drawmode = 1;
var drawspeed = 1;			// fast

// 12/24/24
var showsnaps = 1;

// 1/21/25
var animatecolor = "#ffffff";	// debugging
var startSound = false;		// cannot start sound yet.

const POWERON=0;
const POWEROFF=1;
const MIDICV=4;
const MIDICC=5;
const MIDICVOUT=6;
const MIDICCOUT=7;
const MIDICLOCK=8;
const PATCHIN=9;
const PATCHOUT=10;
const WIRESPLIT=12;
const AINVERT = 13;
const DIMMER = 14;
const ARITHSET=15;
const LOGICAND=16;
const LOGICOR=17;
const LOGICNOT=18;
const LOGICNAND = 19;
const LOGICNOR = 20;
const ARITHPLUS=36;
const ARITHMINUS=37;
const ENDPROG=255;
const WIRE = 109;
const CORNER = 110;
const COUNTER = 111;
const ROTARY = 114;
const GRAPH = 115;
const NOISE = 118;
const VIDEO = 119;
const OSC = 120;
const SPEAKER = 121;
const FILTER = 122;
const SEQUENCER = 123;
const SCOPE = 124;
const MICROPHONE = 125;
const DELAY = 126;
const PANNER = 127;
const MIXER = 128;

var divlist = [
	"headerdiv",
	"logger",
	"progdiv",
	"playdiv",
	"aboutdiv"
];

function UIhidetouch()
{
	UIshowdiv("progdiv");
}

function UIshowabout()
{
	curtab = "abouttab";
	UIshowtab(curtab);
	UIshowdiv("aboutdiv");
}

function UIshowprog()
{
	curtab = "progtab";
	UIshowtab(curtab);
	UIshowdiv("progdiv");
}

function UIshowplay()
{
	curtab = "playtab"
	UIshowtab(curtab);
	UIshowdiv("playdiv");
}

var tablist = [ "abouttab", "progtab", "playtab"];

function UIshowtab(tab)
{	let f = null;
	let i = 0;
	for(i=0; i < tablist.length; i++){
		f = document.getElementById(tablist[i]);
		if( f != null){
			if( tab == tablist[i]){
				f.style.backgroundColor = "green";
				f.style.color = "white";
			}else {
				f.style.backgroundColor = "white";
				f.style.color = "black";
			}
		}
	}
}

function UIshowdiv(div)
{	let f = null;
	hidetouch = false;
	let i = 0;

	for(i=0; i < divlist.length; i++){
		f = document.getElementById(divlist[i]);
		if( divlist[i] == div){
			if( f != null){
				f.style.display = "block";
			}
		}else {
			if( f != null){
				f.style.display = "none";
			}
		}
	}
}

function UIdrawspeed()
{	let f = document.getElementById("drawspeed");
	let speed = 4;

	if( f != null){
		speed = f.value * 1;
	}
	if( speed < 1){
		speed = 1;
	}
	if( speed > 4){
		speed = 4;
	}

	drawspeed = speed;
	drawmode = 2;
}

function UIshowsnaps()
{	let x = document.getElementById("showsnaps");

	if( x != null){
		if( x.checked){
			showsnaps = 1;
		}else {
			showsnaps = 0;
		}
		drawmode = 2;
	}
}


function showSettings()
{	let f = document.getElementById("bitform");
	let msg = "";

	if( f == null){
		return;
	}
	msg += "<h2>Settings</h2>\n";
	msg += "<table><tr><th>Draw speed</th><td>";
	msg += "<select id='drawspeed' onchange='UIdrawspeed();'><option value='3' "+isSelected(drawspeed, 3)+">Slow</option>";
	msg += "<option value='2' "+isSelected(drawspeed, 2)+">Med</option>";
	msg += "<option value='1' "+isSelected(drawspeed, 1)+">Fast</option></select>";
	msg += "</td></tr>\n";

	f.innerHTML = msg;

}

function UIsettrace()
{
	trace = 1;
	debugreset();
}

function message(msg)
{
	logger.innerHTML = msg;
}


var debugcnt = 0;
function debugmsg(msg)
{
	if(debug == null){
		debug = document.getElementById("debugmsg");
	}
	if( debug != null){
		debug.innerHTML += msg+"<br />";
		debugcnt++;
		if( debugcnt > 50){
			debugcnt = 0;
			debugreset();
		}
	}
}

function debugreset()
{
	if(debug == null){
		debug = document.getElementById("debugmsg");
	}
	if( debug != null){
		debug.innerHTML = "";
	}
}

var indicator_data = [0, 0, 0, 0, 0, 0];

function indicator(data, ind)
{
	if( ind >= 0 && ind < indicator_data.length){
		indicator_data[ind] = data;
		drawmode = 2;
	}
}

function indicator_spin( ind)
{
	if( ind >= 0 && ind < indicator_data.length){
		indicator_data[ind]+= 20;
		if(indicator_data[ind] >= 256){
			indicator_data[ind] = 0;
		}
		drawmode = 2;
	}
}

function drawIndicator()
{	let i;
	ctx.save();
	for(i=0; i < indicator_data.length ; i++){
		ctx.fillStyle = m_color(indicator_data[i], 3, 0);
		ctx.fillRect(20+20*i, 20, 10, 10);
	}
	ctx.restore();
}

function display( bit)
{
	if( bitform != null){
		doBitFormAction();
	}
}

function getNumber( val, def)
{
	if( val.length == 0 || isNaN(val) ){
		return def;
	}
	return parseInt(val);
}

function checkRange(x){
	if( x < 0){
		x = 0;
	}else if( x > 255){
		x = 255;
	}else if( isNaN(x)){
		x = 0;
	}
	return x;
}

function checkRange128(x){
	if( x < -128){
		x = -128;
	}else if( x > 127){
		x = 127;
	}else if( isNaN(x)){
		x = 0;
	}
	return x;
}

function bitFlip()
{	var flipit;

	if( selected == null || docktarget != null){
		message("Flip: nothing selected");
		return;
	}
	flipit = selected.getDrag();		// drag is always the bit.

	if( flipit.flip() ){

		display(null);

		displaying = null;
		dragging = null;
		selected = null;
		scanning = null;
		sx = 0;
		sy = 0;
		dx = 0;
		dy = 0;

		doAnimate();
		debugmsg("Flip: flipped!");
	}else {
		message("Flip: cannot flip docked bit");
	}

}

function bitRemove()
{	var rem;

	if( selected == null){
		message("Remove: nothing selected" );
		return;
	}

	if( docktarget != null){
		return;						// dont remove a bit that is docking.
	}

	rem = selected.getDrag();		// drag is always the bit.
	if( rem != null && rem.ctrl != null){
		rem.ctrl.getData();			// clears the form
		rem.ctrl.onRemove();		// cleans up
	}

	if( sketch.delBit( rem ) != 0){
		display(null);

		dragging = null;
		displaying = null;
		selected = null;
		scanning = null;
		sx = 0;
		sy = 0;
		dx = 0;
		dy = 0;

		doAnimate();
	}
	sketch.drawProgram();
}

function UIaddBit(idx, x, y, kit)
{	var nbit;
	var onlyone = 0;
	var d;
	let k = findkit(kit);

	if( k == null){
		message("Addbit: kit "+kit+" not found");
		return;
	}

	// existing selected bit?
	if( selected != null){
		d = selected.getDrag();
		if( d != null  && d.ctrl != null){
			d.ctrl.getData();
		}
	}

	nbit = new Bit(idx, x, y, k.bitnames[idx+2], k.bitnames[idx+3], k);
	sketch.addBit( nbit );

	selected = nbit;

	sketch.drawProgram();
}


// domains are now per snap in bitnames[+12]
function drawChoice(bname, domain, kit)
{	let i;
	let dcw, dch;
	let msg="";
	let greyed = 0;
	let bits = null;
	let k = findkit(kit);

	dcw = sketch.canvas.width;
	dch = sketch.canvas.height;

	if( (domain & activedomains) == 0){
		greyed = 1;
	}
//	debugmsg("drawchoice "+bname+" "+domain+" kit "+kit);

	bits = k.bitnames;

	for(i=0; bits[i] != null ; i += 16){
		if( bits[i+10] == bname){
			msg = "<span ";
			if( greyed == 0){
				msg+=   "onclick='UIaddBit( ";
				msg += i+", ";
				msg += (dcw-150);
				msg += ", 50, ";
				msg += '"'+kit+'"'+")' ";
				msg += "style='cursor:cell;'";
			}else{
				msg+= "style='color:grey;'";
			}
			msg += " />";
			msg += bname+"</span><br />\n";
			return msg;
		}
	}
	msg += "No bits for "+curbittype+"/"+curkitname+"<br />";
	return msg;
}

// all kits
function UIchoosePower()
{	var alist = document.getElementById("addbitdiv");
	var msg = "";

	curbittype = "Power";
	curbitcolor = "blue";

	msg = chooseGroup(curbittype);

	alist.innerHTML = msg;
	alist.style.border = "2px solid blue";
	
}

function UIchooseInput()
{	var alist = document.getElementById("addbitdiv");
	var msg = "";

	curbittype = "Input";
	curbitcolor = "purple";
	msg = chooseGroup(curbittype);

	alist.innerHTML = msg;
	alist.style.border = "2px solid purple";

}

function UIchooseOutput()
{	var alist = document.getElementById("addbitdiv");
	var msg = "";

	curbittype = "Output";
	curbitcolor = "green";
	msg = chooseGroup(curbittype);

	alist.innerHTML = msg;
	alist.style.border = "2px solid green";

}

function UIchooseWire()
{	var alist = document.getElementById("addbitdiv");
	var msg = "";

	curbittype = "Wire";
	curbitcolor = "orange";
	msg = chooseGroup(curbittype);

	alist.innerHTML = msg;
	alist.style.border = "2px solid orange";

}

function UIchooseAction()
{	var alist = document.getElementById("addbitdiv");
	var msg = "";

	curbittype = "Action";
	curbitcolor = "red";
	msg = chooseGroup(curbittype);

	alist.innerHTML = msg;
	alist.style.border = "2px solid "+curbitcolor;

}

function UIchooseLogic()
{	var alist = document.getElementById("addbitdiv");
	var msg = "";

	curbittype = "Logic";
	curbitcolor = "black";
	msg = chooseGroup(curbittype);

	alist.innerHTML = msg;
	alist.style.border = "2px solid black";
}

function chooseGroup(grp)
{	let msg = "";
	let bits = null;
	let i = 0;
	let sbt = null;

//	msg += "Group "+grp+"<br />";

	if(curkit == null){
		curkit = findkit("Basic");
	}

	if(curkit != null){
		bits = curkit.bitnames;
//		msg += "Len "+bits.length+"<br />";

		for(i=0; i < bits.length; i = i+16){
			if(bits[i] != null && bits[i+10] != ""){
				if( bits[i+13] == grp){
					msg += drawChoice(bits[i+10], curkit.getdomain(), curkit.name);
				}
			}
		}
		
	}else {
		msg += "No "+curkit+" / "+grp;
	}

	sbt = document.getElementById("showbittype");
	if( sbt != null){
		sbt.innerHTML = curkit.name +" / "+ grp;
	}

	return msg;

}

function UIchooseKit(kit)
{	let k = findkit(kit);
	let alist = document.getElementById("addbitdiv");
	let msg="";

	if( k != null){
		curkit = k;

		k.selected();

		msg = chooseGroup(curbittype);
		alist.innerHTML = msg;
		alist.style.border = "2px solid "+curbitcolor;
		setInfo(kit+"-info");
	}

}

// the following is called on user interaction.
function UIchooseKit_clicked(kit)
{	
	startSound = true;
	UIchooseKit(kit);
}
//////////////////////////////////////////////////////////////////////////
//
// Local SoftBits execution
//

function Chain()
{
	this.startvalue=255;
	this.data=255;
	this.counter = 0;	
	thisflags = 0;
	this.prevvalue = 0;

	this.Init = function()
	{
		this.data= 255;
		this.startvalue = 255;
	}
}

// byte codes
function Source()
{	this.msg = "";
	this.chain = 0;
	this.code = null;
	this.codebits = null;
	this.codelen = 0;
	this.codeptr = 0;
	this.name = "";

	this.startCode = function( codesize)
	{	var i;
		this.code = new Array(codesize);
		this.codebits = new Array(codesize);

		for(i=0; i < codesize; i++){
			this.code[i] = 255;
			this.codebits[i] = null;
		}
		this.codeptr = 0;
		this.codelen = codesize;
		this.msg = "";
		this.chain = 0;
	}

	this.endCode = function( prog)
	{
		this.code = null;
		this.codebits = null;
	}


	this.addCode = function(code)
	{	let limit;

		if( this.code == null){
			this.code.debug();
			return;
		}
		limit = this.code.length;
		code = checkRange(code);

		this.code[ this.codeptr] = code;
		this.codeptr++;
		this.codebits[this.codeptr] = null;
		if( this.codeptr > limit-10){
			message("Addcode limit "+this.codeptr);
			this.codeptr = limit-10;
		}
	}

	this.codeBit = function(bit)
	{	var code;

		if( bit == null){
			return;
		}
		code = bit.code;

		this.codebits[this.codeptr] = bit;
		bit.addr = this.codeptr;
		this.addCode( code);

	}

	this.codeBit1 = function(bit, arg1)
	{
		var code;

		if( bit == null){
			return;
		}
		code = bit.code;

		this.codebits[this.codeptr] = bit;
		bit.addr = this.codeptr;
		this.addCode( code);	
		this.addCode( arg1);	
	}

	this.codeBit2 = function(bit, arg1, arg2)
	{	let code;

		if( bit == null){
			return;
		}
		code = bit.code;

		this.codebits[this.codeptr] = bit;
		bit.addr = this.codeptr;
		this.addCode( code);	
		this.addCode( arg1);	
		this.addCode( arg2);	
	}

	this.Init = function()
	{
	}
}

function drawFunction(idx)
{	let code = Math.floor(idx / 8);
	return "Bit("+(idx+1).toString(16)+":"+code+")"  + "();<br>\n";
}

function drawFunction1(idx, arg1)
{	let code = Math.floor(idx / 8);
	return "Bit("+(idx+1).toString(16)+":"+code+")" + "(" + arg1 + ");<br>\n";
}


// microcode the actions.
var bytecode = [
	[1, 0],		// 0 POWERON
	null,
	null,
	null,

	[ 1, 3, 29, 0],							// 4 MIDICV		poweron getvalue
	[ 1, 3, 29, 0],							// 5 MIDICC	    poweron getvalue
	[ 4, 11, 12, 9, 7, 29, 0],			// 6 MIDICVOUT  arg2 curchain if data2 fi setvalue storedata blacksnap
	[ 4, 11, 12, 9, 7, 29, 0 ],			// 7 MIDICCOUT  arg2 arg2? if data2 fi setvalue storedata blacksnap

	[ 5, 0, 9, 3, 28, 0],				// 8 MIDICLK
	null,
	null,
	null,

	[ 4, 16, 0],						// 12 WIRESPLIT
	[ 5, 0, 37, 20, 21, 0],				// 13 ARITHINVERT
	[ 5, 0, 39, 20, 29, 0],				// 14 DIMMER
	null,								// 15 


	[ 4, 6, 5, 0, 13, 14, 26, 0 ],		// 16 LOGICAND	arg2 arg2? curchain not if exit fi fetch2 AND 
	[ 4, 6, 5, 0, 13, 17, 26, 0 ],		// 17 LOGICOR
	[ 5, 0, 38, 26, 0],					// 18 LOGICNOT  curchain not if exit fi NOT
	[ 4, 6, 5, 0, 13, 15, 26, 0 ],		// 19 LOGICNAND

	[ 4, 6, 5, 0, 13, 18, 26, 0 ],		// 20 LOGICNOR
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,


	null,		// 32
	null,
	null,
	null,

	// arg2 arg2==0 if done fetch op store display
	[ 4, 6, 5, 0, 13, 22, 20, 28, 0],		// 36 ARITHPLUS
	[ 4, 6, 5, 0, 13, 23, 20, 28, 0],		// 37 ARITHMINUS
	[ 4, 6, 5, 0, 13, 31, 20, 28, 0],		// 38 ARITHTIMES
	[ 4, 6, 5, 0, 13, 32, 20, 28, 0 ],		// 39 ARITHDIVIDE

	null,
	[ 4, 6, 5, 0, 13, 33, 20, 28, 0],		// 41 ARITHDIFF
	[ 4, 6, 5, 0, 13, 19, 26, 0],			// 42 LOGICXOR
	[ 4, 6, 5, 0, 13, 34, 20, 28, 0],		// 43 ARITHCOMPARE  (GT)

	[ 4, 6, 5, 0, 13, 35, 36, 20, 26, 0],	// 44 latch
	null,
	null,
	null,


	null,		// 48
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,


	[ 4, 6, 5, 0, 9, 12, 3, 28, 0],		// 64 Mandlebrot  arg2? if exit fi setv 1 setv 2 getv
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,



	null,		// 80
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,


	null,		// 96
	null,
	null,
	null,

	null,
	null,
	null,
	[ 4, 5, 0, 3, 43, 0],				// 103 PIANO

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	[ 5, 0, 9, 3, 28, 40, 41, 0],			// 111 COUNTER   curchain not if exit fi 0 setvalue getvalue white execmode dispmode exit


	[ 5, 0, 44, 20, 25, 0],		// 112 SWITCH
	[ 5, 0, 44, 20, 25, 0],		// 113 switch
	[ 5, 0, 39, 20, 29, 0],				// 114 rotary
	[ 4, 5, 0, 9, 12, 41, 43, 20, 28, 0],	// 115 GRAPH

	null,
	null,
	[ 5, 0, 28, 0],							// 118 noise
	[ 1, 3, 0],							// 119 camera

	[ 4, 24, 12, 8, 9, 11, 25, 0],		// 120 OSC
	[ 4, 8, 11, 10, 9, 7, 0],			// 121 speaker
	[ 4, 12, 42, 7, 25, 0],				// 122 FILTER
	[ 5, 0, 9, 3, 28, 0],				// 123 SEQUENCER

	[ 5, 0, 9, 7, 25, 0],				// 124 SCOPE
	[ 1, 3, 0],							// 125 MICROPHONE
	[ 4, 12, 42, 7, 25, 0],				// 126	DELAY
	[ 4, 12, 42, 7, 25, 0],				// 127	PANNER


	[ 4, 12, 42, 7, 25, 0],				// 128 MIXER
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,



	null,		// 144
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,


	null,		// 160
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,


	null,		// 176
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,


	null,		// 192
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,



	null,		// 208
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,


	null,		// 224
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,


	null,		// 240
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	null,

	null,
	null,
	null,
	[2, 0]		// 255 ENDPROG

];

function audioRelink( )
{	let partner;
	let bl = sketch.blist;
	let b;

//	debugmsg("Audio Relink");
	while(bl != null){
		b = bl.bit;

//		debugmsg("Bit "+b.code);
		if( b.snaps[1] != null){
			partner =  b.snaps[1].paired;
			if( partner != null){
				b.undock(partner.bit);
				partner.bit.dock(b, 0);
//				debugmsg(" partner 1 "+partner.bit.code);
			}
		}
		if( b.snaps[3] != null){
			partner =  b.snaps[3].paired;
			if( partner != null){
				b.undock(partner.bit);
				partner.bit.dock(b, 2);
//				debugmsg(" partner 3 "+partner.bit.code);
			}
		}
		bl = bl.next;
	}
}


function Program()
{	this.prog = null;
	this.current = null;
	this.currentbits = null;
	this.newprogram = null;
	this.newprogrambits = null;
	this.chains = null;
	this.tlist = null;
	this.s;
	this.domain = 0;
	this.source = null;
	this.sdomain = 0;
	this.sendsize = 0;		// used by wire send
	this.needsend = 0;		// used by wire send and wire recv
	this.senddata = null;	// used by wire send
	this.prevdata= null;
	this.now = performance.now();


// program resetData
	this.resetData = function()
	{	var i;
		var bl;

		if( this.chains != null){
			for(i=0; i < this.chains.length; i++){
				this.chains[i].startvalue = 255;
				this.chains[i].data = 255;
				this.prevdata[i] = 256;
			}
		}
	}


	// program insertTempPowerOn
	this.insertTempPowerOn = function(snxt)
	{	var p;
		var nbit;
		var tl;
		let bit = snxt.bit;
		let osnap;
		let k = findkit("Basic");

		// need a temp power on for the rest of the chain.
		nbit = new Bit(0, 50, 300, k.bitnames[ 2], k.bitnames[ 3], k);
		nbit.snaps[0] = new Snap(nbit, "-l", 0, 0, 0, 0, 0, 0, 0);		// add snap 0 to save back link.

		tl = new Bitlist(nbit);
		tl.next = sketch.blist;		// add bit to global bitlist
		sketch.blist = tl;
		nbit.carrier = tl;

		tl = new Bitlist(nbit);	// add a temp list entry for it.
		tl.next = this.tlist;
		this.tlist = tl;

		// insert before this bit.
		p = snxt.paired;
		osnap = nbit.snaps[1];
		if(osnap == null){
			osnap = nbit.snaps[3];
		}
		snxt.paired = osnap;

		nbit.snaps[0].paired = p;
		osnap.paired = snxt;

		if( p != null){
			p.paired = nbit.snaps[0];
		}
		return nbit;
	}

// program.markchain
	this.markChain = function( bit)
	{	let bpair, bpair2;
		let nbit;
		let tl;
		let chain;
		let code;
		let xsnap;
		let p;
		let msg="";
		let dom = 0;

		this.source[dom].chain++;
		chain = this.source[dom].chain;

		while(bit != null && bit.chain == 0){
			bit.chain = chain;
			code = bit.code;

			// get next in chain.
			xsnap = bit.snaps[1];		// remember which snap bpair is associated with
			if( xsnap == null){
				xsnap = bit.snaps[3];	// corner ?
			}
			bpair = this.getPair( xsnap);

			// look for wire recv			
			if( bpair != null){
				code = bpair.code;
			}
			// look for output sends..
			if(  xsnap != bit.snaps[3] && bit.snaps[3] != null && bit.snaps[3].paired != null){
				bpair2 = bit.snaps[3].paired.bit;

				// need a temp power on for the send chain.
				nbit = this.insertTempPowerOn( bit.snaps[3].paired);

				nbit.chain = 0;

				this.markChain(nbit);
			}

			// make sure that this chain is not a side chain of the next bit
			if( bpair != null && bpair.snaps[2] == xsnap.paired){
				// linked to side input..
				bpair = null;
			}
			bit = bpair;
		}
	}


	this.drawCode = function( )
	{	var codediv;
		var msg="";
		var i, j;
		var cd;

		codediv = document.getElementById("codediv");
		codebox = document.getElementById("code");

		if( showcode == 1){
			for(cd=0; cd < 2; cd ++){

				if( cd == 0){
					msg += "// these run on the web page *<br />\n";
				}else {
					msg += "// these run on the Arduino <br />\n";
				}
				i = 0;
				j = 0;
				while( i != this.source[cd].codeptr){
					if( this.source[cd].code != null){
						msg += hexCode( this.source[cd].code[i]);
						i++;
						j++;
					}
				}
				msg += "<br />\n";
			}
			codediv.display="block";
			codebox.display="block";
			codebox.style.borderColor="blue";
		}else {
			codediv.display="none";
			codebox.display="none";
			codebox.style.borderColor="#ffffff";
		}
		codebox.innerHTML = msg;
		return msg;
	}
	


	// this is the parser 
	// that generates the code from the 
	// bit list
	// one pass marks the chain that a bit is in
	// and second pass outputs the code.

	this.prevNonWChain = function(bit, marker)
	{	let shead;
		let b, p;

		shead = null;
		b = bit;
		while(b!= null){
			b.chain = marker;
			shead = b.snaps[0];
			if( b.snaps[0] != null){
				p = b.snaps[0].paired;
				if( p != null && (p.code == WIRE || p.code == CORNER) ){
					b = p;
				}else {
					b = null;
				}
			}else {
				b = null;
			}
		}
		return shead;
	}

	this.nextNonWChain = function(bit)
	{	let stail;
		let b,p;

		stail = null;
		b = bit;
		while(b!= null){
			stail = b.snaps[1];
			if( stail == null){
				stail = b.snaps[3];
			}
			if( stail != null){
				p = stail.paired;
				if( p != null && (p.code == WIRE || p.code == CORNER) ){
					b = p;
				}else {
					b = null;
				}
			}else {
				b = null;
			}
		}
		return stail;
	}

	this.removeWChain = function(bit)
	{	var shead, stail;
		var bl;

		bl = new Bitlist( bit);
		bl.next = this.tlist;
		this.tlist = bl;

		shead = this.prevNonWChain(bit, 99);

		stail = this.nextNonWChain(bit);

		// unlink wire
		if( shead.paired != null){
			shead.paired.paired = stail.paired;
		}
		if( stail.paired != null){
			stail.paired.paired = shead.paired;
		}
	}

	this.relinkWChain = function(bit)
	{	var shead, stail;

		// search up chain for the first non wire/corner
		shead = this.prevNonWChain(bit, 0);

		stail = this.nextNonWChain(bit);

		// unlink wire
		if( shead.paired != null){
			shead.paired.paired = shead;
		}
		if( stail.paired != null){
			stail.paired.paired = stail;
		}
		
	}

	this.drawProgram = function( )
	{	let b;
		let msg="";
		let bit;
		let progbox;
		let progdiv;

		progbox = document.getElementById("program");
		progdiv = document.getElementById("programdiv");

		this.source[0].startCode(128);
		this.source[1].startCode(64);

		// PASS 1
		// clear the chain var.
		b = sketch.blist;
		while(b != null){
			bit = b.bit;
			bit.chain = 0;
			b = b.next;
		}

		// temp remove the wire and corner
		this.tlist = null;

		b = sketch.blist;
		while(b != null){
			bit = b.bit;
			if( bit.code == WIRE || bit.code == CORNER){
				if( bit.chain == 0){
					this.removeWChain(bit);
				}
			}
			b = b.next;
		}

		// calculate the domain of the linked bits.
		// this.markDomain( sketch.blist);

		// find power on
		b = sketch.blist;
		this.chain = 0;
		while(b != null){
			bit = b.bit;
			
			if( bit.code == POWERON || bit.code == MIDICV || bit.code == MIDICC || bit.code == MICROPHONE ){
				// a power_on
				this.markChain(bit);
			}
			b = b.next;
		}

		// PASS 2
		b = sketch.blist;
		while(b != null){
			bit = b.bit;
			
			if( bit.code == POWERON || bit.code == MIDICV || bit.code == MIDICC || bit.code == MICROPHONE ){
				// a power_on
				this.drawMesh(bit );
			}
			b = b.next;
		}

		// process all the temp power on.
		b = this.tlist;
		while(b != null){
			bit = b.bit;
			
			if( bit.code == POWERON ){
				// a power_on
				// this.drawMesh(bit );

				// remove the temp powerOn
				if( bit.snaps[0].paired != null){
					bit.snaps[0].paired.paired = bit.snaps[1].paired;
				}
				if( bit.snaps[1].paired != null){
					bit.snaps[1].paired.paired = bit.snaps[0].paired;
				}

				bit.snaps[0].paired = null;
				bit.snaps[1].paired = null;

				// remove from global blist
				if( bit.carrier == sketch.blist){
					sketch.blist = bit.carrier.next;
					bit.carrier.next = null;
					bit.carrier.bit = null;
				}else {
					bit.carrier.bit = null;
					bit.carrier.delBit();
				}
				bit.carrier = null;

			}
			b = b.next;
		}

		// relink the wire/corners
		// and remove the temp power ons.
		b = this.tlist;
		this.tlist = null;
		while( b != null){
			tlnext = b.next;
			if( b.bit.code == WIRE || b.bit.code == CORNER){
				this.relinkWChain(b.bit);

			}else {
				b.bit.carrier = null;
			}
			b.bit = null;
			b = tlnext;
		}

		if( showprogram == 1){
			msg += "// local program "+this.source[0].codeptr+"<br />\n";
			msg += this.source[0].msg;
			msg += "<br />\n";
			msg += "// Arduino program <br />\n";
			msg += this.source[1].msg;
			progbox.display="block";
			progdiv.display="block";
			progbox.style.borderColor="green";
		}else {
			progbox.display="none";
			progdiv.display="none";
			progbox.style.borderColor="white";
		}
		progbox.innerHTML = msg;

		this.drawCode();
		this.resetData();		// reset start values and prevdata values.

		// outCode(this.source[1].code, this.source[1].codeptr);

		this.newprogram = this.source[0].code;
		this.newprogrambits = this.source[0].codebits;

		this.source[0].endCode(this);
		this.source[1].endCode(this);
	}

	this.getPair = function(snap)
	{
		if( snap == null || snap.paired == null){
			return null;
		}
		return snap.paired.getDrag();
	}


// program drawMesh
	this.drawMesh = function(bit)
	{	let b = bit;
		let idx;
		let bnxt = null;
		let bpair, bpair2;
		let code=5;
		let cd;
		let msg;
		let dom = 0;
		let bt = 0;
		
		while(b != null){
			bt = b.btype & 7;
			idx = b.btype - bt;
			bpair = this.getPair( b.snaps[1]);
			bpair2 = this.getPair( b.snaps[3]);
			code = b.code;

			cd = 0;		//debug
			if(trace == 1){
				debugreset();
				trace++;
			}

			if( trace > 0){
				debugmsg("Trace: "+b.name+" "+idx+" "+code+" dom "+cd);
			}
			if( code == POWERON || code == MIDICV || code == MIDICC || code == MICROPHONE ){		// power on
				this.source[cd].msg += drawFunction1( idx, b.chain);
				this.source[cd].codeBit1(b, b.chain);

			}else if( code == POWEROFF){	// power off
				this.source[cd].msg += drawFunction(idx);
				this.source[cd].codeBit(b);

			}else if( b.snaps[0] != null && b.snaps[2] != null){
				// two input snaps
				bnxt = this.getPair( b.snaps[2]);
				if( bnxt != null){
					this.source[cd].msg += drawFunction1( idx, bnxt.chain);
					this.source[cd].codeBit1(b, bnxt.chain);
				}else {
					this.source[cd].msg += drawFunction1( idx, 0);
					this.source[cd].codeBit1(b, 0);
				}
			}else if( b.snaps[1] != null && b.snaps[3] != null){
				// two output snaps

				if( bpair2 != null){
					this.source[cd].msg += drawFunction1(idx, bpair2.chain);
					this.source[cd].codeBit1(b, bpair2.chain);
				}else {
					this.source[cd].msg += drawFunction1(idx, 0);	// nothing linked to output2 so no send.
					this.source[cd].codeBit1(b, 0);
				}
			}else {
				this.source[cd].msg += drawFunction( idx);		
				this.source[cd].codeBit(b);
			}
			// get next bit, if bit has different chain then done.
			// if domain is different the also done.
			if( bpair == null){
				if( bpair2 != null && b.chain == bpair2.chain){
					b = bpair2;
				}else {
					b = null;
				}
			}else{
				// bpair not null
				if( b != null && b.chain != bpair.chain){
					b = null;	// chain mismatch
				}else {
					b = bpair;
				}
			}
		}
		trace = 0;	
	}

	////////////////

	////////////////

	this.runProgram = function(now)
	{	let i=0;
		var prog = this.current;
		var progbits = this.currentbits;

		this.now = now;

		curprog = prog;

		if( this.newprogram != null){
			prog = this.newprogram;
			progbits = this.newprogrambits;
			this.newprogram = null;
			this.current = prog;
			this.currentbits = progbits;
		}			

		if( prog == null){
			return;
		}
		this.execProgram(prog, progbits);
	}

	this.Init = function()
	{	var i;
		this.chains = new Array(20);
		this.prevdata = new Array(20);

		for(i=0; i < 20 ; i++){
			this.chains[i] = new Chain();
			this.chains[i].Init();
			this.prevdata[i] = 256;
		}
		this.source = new Array(2);
		this.source[0] = new Source();	// web page
		this.source[1] = new Source();	// arduino page
	}

//////////////////////////////////////////////////////////////////////////

	this.getValue = function(progbits, idx, def)
	{
		if( progbits != null && progbits[idx] != null){
			return progbits[idx].value;		// get the value
		}
		return def;
	}

	this.getValue2 = function(progbits, idx, def)
	{
		if( progbits != null && progbits[idx] != null){
			return progbits[idx].value2;		// get the value
		}
		return def;
	}

	this.getchaindata  = function(arg, nchains)
	{	let data = null;
		if( arg > 0 && arg < nchains){
			data = this.chains[ arg].data;
		}else {
			debugmsg("getchaindata: "+arg+" not valid "+nchains);
		}
		return data;
	}

	this.setchaindata = function(arg, nchains, data)
	{	if( arg > 0 && arg < nchains){
			this.chains[ arg ].startvalue = data;
		}else if( arg >= nchains){
			debugmsg("setchaindata "+arg+" not valid "+nchains);
		}
}

	// prog is threaded code. bp is instruction pointer.
	// this model has chains of execution where a value is passed from function to function.
	// a chain starts with a power on.
	// there is common functionality that now has been given byte codes and
	// a simple interpreter executes the codes.
	this.execProgram = function(prog, progbits)
	{	let curchain = 0;
		let chain = 0;
		let bp = 0;
		let code = 0;
		let ibp = 0;
		let arg2, arg3;
		let data = 0, data2;
		let nchains = 20;
		let osnap = null;
		let ip = 0;
		let msg = "";
		let trace = false;
		let ctrl = null;

		this.needsend = 0;	
		this.sendsize = 8;		// allow for 0xf0 S B P 0x06 seqh seql ver
		indicator_spin(5);

		while( prog != null){
			ibp = bp;
			code = prog[bp];
			bp++;
			// different bit each time through here. Fetch data if curchain is valid.
			if( curchain > 0 && curchain < nchains){
				data = this.chains[ curchain].data;
			}else {
				data = 0;
			}
			msg += "["+code+":"+curchain+":"+data+"]";
			data2 = data;


			bytes = bytecode[code];						// is there a bytecode sequence for this?
			if( bytes != null){
				ip = 0;
				while( bytes[ip] != 0){
					if( trace){
						msg += bytes[ip]+",";
					}
					switch(bytes[ip]){
						case 0:							// null, used as end of code.
							trace = false;
							break;
						case 1:							// poweron etc
							chain = prog[bp];
							bp++;
							if( chain < 0 || chain >= nchains){
								prog = null;
							}else {
								curchain = chain;
								data = this.chains[curchain].startvalue;
								this.chains[ curchain].data = data;
							}
							break;
						case 2:
							prog = null;				// endprog
							break;
						case 3:							// getvalue
							if( curchain != 0){
								this.chains[ curchain].data = this.getValue( progbits, ibp, 255);
							}
							break;
						case 4:
							arg2 = prog[bp];		// get arg , literal.
							bp++;
							break;
						case 5:
							if( curchain != 0){		// if curchain != 0 skip, next code is usually 0 (done )
								ip++;
							}
							break;
						case 6:
							if(arg2 == 0){				// 6	if second input is not connected, set curchain to 0 ( invalid )
								curchain = 0;
							}
							break;
						case 7:
							progbits[ibp].value = this.chains[ curchain].data;
							break;
						case 8:
							if(curchain  == 0){		// 8
								data = 0;			// silence speaker if not linked in a chain.
							}
							break;
						case 9:						// control
							ctrl = progbits[ ibp].ctrl;
							if( ctrl == null){
								debugmsg("ctrl == null, code="+code+" ibp="+ibp);
							}else {
								progbits[ ibp].ctrl.setValue(data, 0);		// 9
							}
							break;
						case 10:					// control
							if(  arg2 > 0 && arg2 < nchains){		//  10	get data from another chain.
								data2 = this.getchaindata(arg2, nchains);
								progbits[ ibp].ctrl.setValue(data2, 1);
							}else {
								progbits[ ibp].ctrl.setValue(128, 1);
							}
							break;
						case 11:					// not 5  if( curchain != 0) X
							if( curchain == 0){
								ip++;				// skip
							}
							break;
						case 12:
							if( arg2 > 0 && arg2 < nchains){		//  12 get data from another chain. pass to  ctrl on chan 2
								data2 = this.getchaindata(arg2, nchains);
								progbits[ ibp].ctrl.setValue(data2, 1);	// 
							}
							break;
						case 13:
							data2 = this.getchaindata(arg2, nchains);		// 13 get data2 from another chain.
							break;
						case 14:										// and
							if( data > 127 && data2 > 127){
								this.chains[ curchain].data = 255;
							}else {
								this.chains[ curchain].data = 0;
							}
							break;
						case 15:										// nand
							if( data > 127 && data2 > 127){
								this.chains[ curchain].data = 0;
							}else {
								this.chains[ curchain].data = 255;
							}
							break;
						case 16:
							if( curchain != 0){		 					// 16  write another chain start value.
								this.setchaindata(arg2, nchains, data);
							}
							break;
						case 17:								// OR
							if( data > 127 || data2 > 127){
								this.chains[ curchain].data = 255;
							}else {
								this.chains[ curchain].data = 0;
							}
							break;
						case 18:								// NOR
							if( data > 127 || data2 > 127){
								this.chains[ curchain].data = 0;
							}else {
								this.chains[ curchain].data = 255;
							}
							break;
						case 19:								// xor
							if( data > 127 && data2 > 127){
								this.chains[ curchain].data = 0;
							}else if( data <= 127 && data2 <= 127){
								this.chains[ curchain].data = 0;
							}else {
								this.chains[ curchain].data = 255;
							}
							break;
						case 20:
							data = checkRange(data);			// 20
							this.chains[ curchain].data = data;
							break;
						case 21:
							break;
						case 22:
							data = data+data2;		// 22
							break;
						case 23:
							data = data-data2;
							break;
						case 24:
							data2 = data;
							break;
						case 25:
							if( progbits[ibp] != null && progbits[ibp].snaps[1] != null){
								osnap = progbits[ibp].snaps[1];
								osnap.indcolor = "#ff0000";						// 25	RED
								osnap.indval = this.chains[ curchain].data;
							}
							break;
						case 26:
							if( progbits[ibp] != null && progbits[ibp].snaps[1] != null){
								osnap = progbits[ibp].snaps[1];
								osnap.indcolor = "#00ff00";						// 26	GREEN
								osnap.indval = this.chains[ curchain].data;
							}
							break;
						case 27:
							if( progbits[ibp] != null && progbits[ibp].snaps[1] != null){
								osnap = progbits[ibp].snaps[1];
								osnap.indcolor = "#0000ff";						// 27	BLUE
								osnap.indval = this.chains[ curchain].data;
							}
							break;
						case 28:
							if( progbits[ibp] != null && progbits[ibp].snaps[1] != null){
								osnap = progbits[ibp].snaps[1];
								osnap.indcolor = "#ffffff";						// 28	WHITE
								osnap.indval = this.chains[ curchain].data;
							}
							break;
						case 29:
							if( progbits[ibp] != null && progbits[ibp].snaps[1] != null){
								osnap = progbits[ibp].snaps[1];
								osnap.indcolor = "#000000";						// 29	BLACK
								osnap.indval = this.chains[ curchain].data;
							}
							break;
						case 30:
							if( progbits[ibp] != null && progbits[ibp].snaps[1] != null){
								osnap = progbits[ibp].snaps[1];
								osnap.indcolor = "#ffff00";						// 30	YELLOW
								osnap.indval = this.chains[ curchain].data;
							}
							break;
						case 31:
							data = data * data2;	// 31
							break;
						case 32:											// 32 divide
							if( data2 != 0){							// 32
								data = data * 128;
								data = Math.floor(( data / data2) / 128);
							}else {
								data = 255;
							}
							break;
						case 33:
							if( data > data2){					// 33	diff
								data = data - data2;
							}else {
								data = data2 - data;
							}
							break;
						case 34:						// GT
							if( data > data2){			// 34
								data = 255;
							}else {
								data = 0;
							}
							break;
						case 35:
							if( data2 > 127 && progbits[ ibp].prevvalue < 128){	// 35
								progbits[ ibp].value = data;
							}
							data = progbits[ ibp].value;
							progbits[ ibp].prevvalue = data2;
							break;
						case 36:
							if( data > 128){				// boolean
								data = 255;
							}else {
								data = 0;
							}
							break;
						case 37:
							data = 255 - data;				// invert
							break;
						case 38:
							if( data > 127){					// 38 NOT
								this.chains[ curchain].data = 0;
							}else{
								this.chains[ curchain].data = 255;
							}
							break;
						case 39:
							data = Math.floor( ( data * this.getValue( progbits, ibp, 255) ) / 256);
							break;
						case 40:
							execmode = 2;
							break;
						case 41:
							drawmode = 2;
							break;
						case 42:
							if( data < 20){	// effects do not mute output when in is less than 20.
								data = 20;
								this.chains[ curchain].data = data;	
							}
							break;
						case 43:
							if(  arg2 > 0 && arg2 < nchains){
								if( this.chains[ curchain].data != 0){
									this.chains[ arg2 ].startvalue = 255;
								}else {
									this.chains[ arg2 ].startvalue = 0;
								}
							}
							break;
						case 44:
							data2 = this.getValue( progbits, ibp, 0);	// 44
							if( data2 < 128){
								data = 0;
							}
							break;
						case 45:
							debugmsg(msg);
							break;
						case 46:
							trace= true;
							msg = "Trace: ";
							break;
						case 47:							// getvalue2
							if( curchain != 0){
								this.chains[ curchain].data = this.getValue2( progbits, ibp, 255);
							}
							break;

					}
					ip++;
				}
//			}else {
//				debugmsg("No bytes "+msg);
			}

			if( progbits != null && progbits[ibp] != null){
				if( curchain > 0 && curchain < nchains){
					progbits[ibp].data = this.chains[curchain].data;		// update the value
//					debugmsg("EXC "+progbits[ibp].data);
				}
			}
		}
//		debugmsg(msg);
	}
}



//////////////////////////////////////////////////////////////////////////

function getXY(e) {
    var rc = e.target.getBoundingClientRect();
    mx = Math.floor(e.clientX - rc.left);
    my = Math.floor(e.clientY - rc.top);
    if (mx < 0) mx = 0;
    if (my < 0) my = 0;
}


function Snap(bit, side, x, srx, y, sry, w, h, idx)
{
	this.x = x+srx;
	this.y = y+sry;
	this.w = w;
	this.h = h;
	this.rx= srx;
	this.ry = sry;
	this.index = 0;
	this.paired = null	// link to another snap.
	this.side = side;
	this.bit = bit;		// parent
	this.domain = 0;
	this.indval = 0;
	this.indcolor = "";
	this.idx = idx;		// index.  0 = in, 1= out, 2 = in2, 3=out2

	this.domain = (bit.domain >> (idx*4)) & 0xf;
//	debugmsg("SNAP "+bit.name+" "+idx+" "+this.domain);

	// snap
	this.isbit = function()
	{
		return false;
	}

	// snap
	this.issnap = function()
	{
		return true;
	}


	this.drawIndicator = function(orientation, x, y)
	{	var val;
		if( this.indcolor != "" && this.indval != 0){
			
			val = Math.floor(this.indval * 40 / 255);
			ctx.fillStyle = this.indcolor;
			if( orientation == "-l" || orientation == "-r"){
		        ctx.fillRect(x+5, y+45-val, 5, val);	
			}else {
		        ctx.fillRect(x+5, y+5, val, 5);	
			}
		}
	}

	// snap connectto
	this.connectTo = function( other)
	{
		if( other != null){
			if( other.paired != this && this.paired != other){
				// not linked together.
				if( other.paired != null){
					other.unConnect( );
				}
				if( this.paired != null){
					this.unConnect();
				}
				// ok now connect us.
				this.paired = other;
				other.paired = this;
			}
		}else {
			message("<span style='color:red;'>connect-to null</span>");
		}
	}

	// snap unconnect
	this.unConnect = function()
	{	var p = this.paired;

		if( p != null ){
			if( p.paired == this){
				p.paired = null;
			}else {
				message("Bad pair!");
			}
		}
		this.paired = null;	
	}

// snap findlinkedtarget
	this.findLinkedTarget = function()
	{	var b = this.bit;
		var s;
		var i;
		var p;

		if( b.mflag == 0){
			b.mflag = 1;		// mark this bit.

			// check other snaps to see if they should also connect.
			for(i=0; i < 4; i++){
				s = b.snaps[i];
				if( s != null && s != this){
					p = s.paired;
					if( p == null){
						r = s.findTarget();
						if( r != null){
							s.connectTo(r);
						}
					}else {
						p.findLinkedTarget();
					}
				}
			}
		}
	}

// snap dodock
// one snap is out and one is in. 
	this.doDock = function( other)
	{	let b = this.bit;
		let dom = this.domain;
		let dom2 = 0;

		if( other == null){
			return;
		}

		dom2 = other.domain;

		if( (dom & dom2 ) != 0){

			this.connectTo( other);

//			this.domain = (dom & dom2);
//			other.domain = (dom & dom2);

			if( this.idx == 0 || this.idx == 2){
				b.dock(other.bit, this.idx);		// input snap on b
			}else {
				other.bit.dock(b, this.paired.idx);		// output snap on b
			}
		}

		this.findLinkedTarget();
		b.unMark();
	
		reLabel(sketch.blist);
		EXECMODE = 2;
	}

	//snap
	this.unDock = function()
	{	const p = this.paired;
		let i;
		const b = this.bit;
		var s;
		var p2;

		if( b.snaps[0] == this || b.snaps[2] == this){
			b.undock(p.bit);
		}else {
			p.bit.undock(b);
		}
		this.unConnect();

		reLabel(sketch.blist);

		if(p != null &&  p.bit.net == b.net ){
			// still connected via another route
			message("Another connection");
			for(i=0; i < 4; i++){
				s = b.snaps[i];
				if( s != null && s != this){
					p2 = s.paired;
					if( p2 != null && p2.bit.net == b.net){
						// unlink alternate path
						s.unConnect();
						reLabel(sketch.blist);
					}
				}
			}
		}
	}

// snap
	this.Draw = function()
	{
	}

	this.setXY = function( dx, dy)
	{
		this.x = dx;
		this.y = dy;
	}

	this.relXY = function( dx, dy)
	{
		this.x += dx;
		this.y += dy;
	}


// snap
	this.HitTest = function(x, y)
	{	var res = null;
		var tx = this.x;
		var ty = this.y;
		if( x >= tx && x <= tx+this.w &&
			y >= ty && y <= ty+this.h){
			res = this;
		}

//		debugmsg("HT ("+x+","+y+") " +this.side+" x="+this.x+" y="+this.y+" w="+this.w+" h="+this.h);
		return res;
	}

// snap
	this.findTarget = function()
	{	let bx, by;
		let res = null;
		let i;
		let j;
		let oside;
		let dom, odom;
		const b = this.bit;
		let osnap;

		dom = this.domain;

		repel = 0;

		for(j = 30; res == null && j > -11 ; j = j - 10){

			if( this.side == "-l"){
				bx = this.x - j;
				by = this.y + 25;
				oside = "-r";
			}else if( this.side == "-r"){
				bx = this.x + 15 + j ;
				by = this.y + 25;
				oside = "-l";
			}else if( this.side == "-t"){
				bx = this.x + 25 ;
				by = this.y - j;
				oside = "-b";
			}else {
				bx = this.x + 25;
				by = this.y + 15 + j;
				oside = "-t";
			}
	        for (i = sketch.blist ; i != null && res == null; i = i.next) {
				if( i.bit != this.bit){
					res = i.bit.HitTest(bx, by);
					if( res == i.bit){
						res = null;
					}
					if( res != null ){		// res is a snap.
						if( res.paired != null){
							res = null;		// cannot dock with a docked one.
						}else if( res.side != oside){

							// auto rotate check.
							if( b.code == WIRE){
//								debugmsg("FT code="+b.code+" rside="+res.side+" oside="+oside);
								osnap = b.snaps[1];
								if( osnap == null){
									osnap = b.snaps[3];
								}
								if( oside == "-l"){
									osnap.side = "-b";
									osnap.w = 50;
									osnap.h = 15;
								}else if( oside == "-t"){
									osnap.side = "-r";
									osnap.w = 15;
									osnap.h = 50;
								}else if( oside == "-r"){
									b.snaps[0].side = "-t";
									b.snaps[0].w = 50;
									b.snaps[0].h = 15;
								}else if( oside == "-b"){
									b.snaps[0].side = "-l";
									b.snaps[0].w = 15;
									b.snaps[0].h = 50;
								}
							}
							res = null;		// cannot dock with this one.
						}else {
							// check domain
							odom = res.domain;
							if(  (dom & odom) == 0){
								repel = 1;		// do notshare a common domain.
							}
						}
					}
				}
			}
		}
		return res;
	}


// snap
	this.getDrag = function()
	{	var res = this.bit;
		return res;
	}

// snap
	this.findSnap = function()
	{	var res = this;
		return res;
	}

// snap
	this.Animate = function( t)
	{
		if( t > 9){
			t = 9;
		}
		t = 9 - t;

		if( repel == 1){
			ctx.strokeStyle = "#ff0000";
		}else{
			ctx.strokeStyle = animatecolor;
		}
		ctx.lineWidth = 2;

		if( scanning == this){
			if( docktarget != null){
				t = 9 - t;
			}
			if( this.side == "-l"){
				t = (9 - t)*4;
		        ctx.strokeRect(this.x-t, this.y-t+25, 4, t+t);
			}else if( this.side == "-r"){
				t = (9 - t)*4;
		        ctx.strokeRect(this.x+t+20, this.y-t+25, 4, t+t);
			}else if( this.side == "-t"){
				t = (9 - t)*4;
		        ctx.strokeRect(this.x-t+25, this.y-t, t+t, 4);
			}else if( this.side == "-b"){
				t = (9 - t)*4;
		        ctx.strokeRect(this.x-t+25, this.y+t+15, t+t, 4);
			}
		}else {
			ctx.strokeRect(this.x+t, this.y+t, this.w-t-t, this.h-t-t);
		}

	}

	this.setDxDy = function(x, y)
	{
		dx = x - this.x + this.rx;
		dy = y - this.y + this.ry;
	}

	this.print = function()
	{
		return "snap <br />\n";
	}

}



///////////////////////////////// BIT ///////////////////////////////////////
///////////////////////////////// BIT ///////////////////////////////////////
///////////////////////////////// BIT ///////////////////////////////////////
// A bit, the basic bit.
///////////////////////////////// BIT ///////////////////////////////////////
///////////////////////////////// BIT ///////////////////////////////////////

function Bit( btype, x, y, w, h, k) {
	this.x = x;
	this.y = y;
	this.btype = btype;
	this.bcode = Math.floor( btype / 8);
	this.snaps = [ null, null, null, null ];
	this.snapnames = [null, null, null, null];
	this.ctrl = null;
	this.code = this.bcode;		// instruction code. used to be based on bitname index.
	this.mflag = 0;				// mark for move.
	this.initw = w;
	this.inith = h;
	this.carrier = null;		// the bitlist that carries us.
	this.chain = 0;				// the chain this bit is in and used as a marker.
	this.data = 255;
	this.value = 255;
	this.value2 = 255;
	this.prevvalue = 255;
	this.net = 0;				// for labeling nets used in dock/undock.
	this.addr = 0;				// offset of this bit in the codebyte array. 
	this.bitimg = 0;
	this.bitname = "";
	this.kit = k;
	this.name = "unset";
	this.connected = 0;			// count of  connections.
	this.domain = 0;			// not set.
	this.background = "#808080";
	this.color = "#000000";
	this.font = "12px Georgia";

	let bt = (btype & 7);
	let bidx = btype-bt;

	// bit
	this.isbit = function()
	{
		return true;
	}

	// bit
	this.issnap = function()
	{
		return false;
	}



	this.setSnaps = function()
	{
		const sw = 15;
		const sh = 50;

		for(let i = 0; i < this.snaps.length; i++){
			snapname = this.snapnames[ i];
			if( snapname != null){
				if( this.suffix[i] == "-l" || this.suffix[i] == "-r"){		// vertical orientation
					this.snaps[i] = new Snap(this, this.suffix[i], this.x, this.coords[i+i], this.y,this.coords[i+i+1], sw, sh, i);
				}else{
					this.snaps[i] = new Snap(this, this.suffix[i], this.x, this.coords[i+i], this.y,this.coords[i+i+1], sh, sw, i);
				}
			}
		}
	
	
	}

	// bit 
	this.setOrientation = function(bt)
	{
		if( bt == 0 ){
			this.w = this.initw;
			this.h = this.inith;
			if( this.ctrl == null || !this.ctrl.setOrientation(bt)){
				this.coords = [ -15, 0, this.w, 0, (this.w / 2) - 25, -10, (this.w / 2) - 25, this.h ];
				this.suffix = [ "-l", "-r", "-t", "-b" ];
			}
		}else if( bt == 1){
			this.h = this.initw;
			this.w = this.inith;
			if( this.ctrl == null || !this.ctrl.setOrientation(bt)){
				this.coords = [ 0, -15, 0, this.h, -15, (this.h / 2) - 25, this.w, (this.h / 2) - 25 ];
				this.suffix = [ "-t", "-b", "-l", "-r" ];
			}
		}
		// snaps
		let sn = 0;
		let sname = "";
		let btx = this.btype & 7;
		let bidx = this.btype - btx;
		let slen = this.snapnames.length;

		for(sn=0; sn < slen; sn++){
			sname = this.kit.bitnames[bidx+sn+4];
			if(sname != null){
				this.snapnames[sn] = this.findImage(sname+this.suffix[sn]);
//				debugmsg("setO "+sn+" sname "+sname+" idx "+bidx+" bt "+btx+" img "+this.snapnames[sn]) ;
			}
		}
	}

	// bitpics[] are the images
	// bitpicnames[] are the names
	this.findImage = function(name){
		// name, type
		if( name == null || name == ""){
			return 0;
		}
		let iimg = findimage(name);
		if( iimg == null){
			debugmsg("bit.findimage '"+name+"' not found");
			iimg = 0;
		}
		return iimg;
	}

	this.setOrientation( bt);

	let imagename = this.kit.bitnames[bidx];
	if( imagename == ""){
		imagename = "control";
	}
	this.bitimg =this.findImage(imagename);
	this.name = this.kit.bitnames[bidx+1];
	if( this.kit.bitnames[bidx+8] > 0){
		this.code = this.kit.bitnames[bidx+8];
	}else {
		this.code = this.kit.findcode( this.name);
	}
	this.bitname = imagename;
	this.domain = this.kit.bitnames[bidx+12];

	this.setSnaps();

// bit addctrl
	this.addCtrl = function( idx)
	{	var cnum = idx/8;
		var i;
		var ct = null;

		ct = this.kit.addCtrl(this);
		debugmsg("Add Control: "+idx+" "+cnum+" name "+this.name+" "+this.code);
		return ct;

	}


	if( this.kit.bitnames[bidx] == "" || this.kit.bitnames[bidx] == "control" || this.kit.bitnames[bidx+9] > 0){
		this.addCtrl( bidx );
	}

	/// end of initialization

// bit  move the bit relative
	this.relXY = function( dx, dy)
	{	let i;
		const len = this.snaps.length;

		this.x += dx;
		this.y += dy;
		 for(i=0; i < len; i++){
			if( this.snaps[i] != null)this.snaps[i].relXY(dx, dy);
		}
	}

	// move bit and docked bits relative
	this.relXYlinked = function( dx, dy)
	{	// move paired bits
		let i;
		let s;
		let p;
		const len = this.snaps.length;

		if( this.mflag == 0)
		{
			this.mflag = 1;	// mark me
			for(i=0; i < len; i++){
				s = this.snaps[i];
				if( s != null && s.paired != null){
					p = s.paired;
					p.bit.relXYlinked( dx, dy);
				}
			}
			this.relXY(dx, dy);		// move me
//			this.mflag = 0;
		}
	}

	// set the position of the bit absolute
	this.setXY = function( x, y)
	{	let dx, dy;

		dx = x - this.x
		dy = y - this.y;
		this.relXY( dx, dy);

	}


	this.setXYlinked = function( x, y)
	{	let dx, dy;

		dx = x - this.x
		dy = y - this.y;
		this.relXYlinked( dx, dy);

	}

	// global dx and dy are used to hold the difference between the
	// bit top left and the mouse down point so dragging works ok.
	//
	this.setDxDy = function(x, y)
	{
		dx = x - this.x;
		dy = y - this.y;
	}

	// is the coordinate x,y in this bit?
	// bit
	this.HitTest = function(x, y)
	{	let res = null;
		let i;
		let slen = this.snaps.length;

		if(  x >= this.x && x <= this.x+this.w &&
			y >= this.y && y <= this.y+this.h){
			res = this;
		}

		for(i=0; res == null && i < slen; i++){
			if(  this.snaps[i] != null){
				res = this.snaps[i].HitTest(x, y);
			}
		}
		return res;
	}

// bit hithandle
	this.hitHandle = function( x, y)
	{
		if( x >= this.x+this.w && x <= this.x+this.w+25 &&
			y >= this.y+this.h && y <= this.y+this.h+25)
		{
			return 1;		// flip
		}

		if( x >= this.x-25 && x <= this.x &&
			y >= this.y-25 && y <= this.y)
		{
			return 2;		// remove
		}
		return 0;
	}

	// used to draw the bit's label.
	this.drawText = function( ctx, msg)
	{	var btmp = this.btype & 7;

		if( this.color != ""){
	        ctx.fillStyle = this.color;
		}
		if( this.font != ""){
	        ctx.font = this.font;
		}
		if( btmp == 0){
			ctx.fillText(msg, this.x+10, this.y+25 );
		}else {
//			ctx.save();
			ctx.translate( this.x+15, this.y+10);
			ctx.rotate( Math.PI/2);
			ctx.fillText(msg, 0, 0 );
//			ctx.restore();
		}
	}

// bit drawdata
	this.drawData = function( ctx)
	{	let btmp = this.btype & 7;
		let data = Math.floor(this.data);

        ctx.fillStyle = this.color;
		if( btmp == 0){
			ctx.fillText(""+data, this.x+this.w-30, this.y+this.h-10 );
		}else {
			ctx.translate( this.x+this.w-20, this.y+this.h-30);
			ctx.rotate( Math.PI/2);
			ctx.fillText(""+data, 0, 0 );
		}
	}

// bit.draw()
	this.Draw = function( pass)
	{	var snapname = null;
		const btmp = this.btype & 7;
		let img = 0;
		let sx,sy,sw,sh;
		let sn;

        if( pass == 0){
			img = this.bitimg;

//			debugmsg("Draw "+img+" x="+this.x);
			if( btmp == 0){
				drawImage( img , this.x, this.y);
			}else {
				// -v version
				img = img+1;
				drawImage( img , this.x, this.y);
			}
			if( this.chain != 0){
				// draw the power border
				if( showchains == 1){
					ctx.lineWidth = 2;
					ctx.strokeStyle = powerColors[this.chain];
					ctx.strokeRect(this.x-2, this.y-2, this.w+4, this.h+4);
				}
			}
		}else if( pass == 2){
				snapname = this.snapnames[0];
				if( this.code != WIRE ){		
					if( snapname != null){	
						if( showsnaps == 1){	// input snaps
							drawImage(snapname, this.x+this.coords[0], this.y+this.coords[1]);
							this.snaps[0].drawIndicator( this.suffix[0], this.x+this.coords[0], this.y+this.coords[1]);
						}else if( this.snaps[0].paired != null){
							sn = this.snaps[0];
							if( sn.side == "-l"){
								sx = sn.x-15;
								sy = sn.y+sn.h/2 - 2;
								sw = 30;
								sh = 5;
							}else {
								sx = sn.x+sn.w/2 -2;
								sy = sn.y-15;
								sw = 5;
								sh = 30;
							}

							ctx.fillStyle = powerColors[this.chain];
							ctx.fillRect(sx, sy, sw, sh);
						}
					}
				}
				snapname = this.snapnames[2];
				if( snapname != null){	
					if( showsnaps == 1){	// input snaps
						drawImage(snapname, this.x+this.coords[4], this.y+this.coords[5]);
						this.snaps[2].drawIndicator( this.suffix[2], this.x+this.coords[4], this.y+this.coords[5]);
					}else if( this.snaps[2].paired != null){
						sn = this.snaps[2];
						if( sn.side == "-l"){
							sx = sn.x-15;
							sy = sn.y+sn.h/2 - 2;
							sw = 30;
							sh = 5;
						}else {
							sx = sn.x+sn.w/2 -2;
							sy = sn.y-15;
							sw = 5;
							sh = 30;
						}

						ctx.fillStyle = powerColors[sn.paired.bit.chain];
						ctx.fillRect(sx, sy, sw, sh);
					}
				}
		}else if( pass == 1 ){
				snapname = this.snapnames[1];
				if( this.code != WIRE  ){		// wire draw its own snaps
					if( snapname != null){
						if( showsnaps == 1){	// output snaps
							drawImage(snapname, this.x+this.coords[2], this.y+this.coords[3]);
							this.snaps[1].drawIndicator( this.suffix[1], this.x+this.coords[2], this.y+this.coords[3]);
						}
					}
				}
				snapname = this.snapnames[3];
				if( snapname != null){
					if( showsnaps == 1){	// output snaps
						drawImage(snapname, this.x+this.coords[6], this.y+this.coords[7]);
						this.snaps[3].drawIndicator( this.suffix[3], this.x+this.coords[6], this.y+this.coords[7]);
					}
				}
		}else if( pass == 3){
			if( this.ctrl != null){
				if( this.code == SPEAKER && this.chain == 0){
					this.ctrl.setValue(0, 0);
				}
				this.ctrl.Draw();
			}
		}
		if( !this.isDocked() && selected ==this ){
			// if a selected bit is not docked then show the handles
			if( btmp == 0){
				drawImage( flipimg, this.x+this.w, this.y+this.h);
			}else {
				drawImage( flipvimg, this.x+this.w, this.y+this.h);
			}
			drawImage( removeimg, this.x-25, this.y-25);
		}

	}

// bit isDocked()
	this.isDocked = function()
	{	let i;
		const len = this.snaps.length;

		for(i=0; i < len; i++){
			if( this.snaps[i] != null && this.snaps[i].paired != null){
				return true;		// cannot flip if it is docked
			}
		}
		return false;
	}

	// input / output
	// this bit is the receiver
	// added snap index 
	this.dock = function(partner, sidx)
	{	let i = 0;
		let msg = "";
		let slen = this.snaps.length;
		let p = null;
		let snap = this.snaps[sidx];

//		debugmsg("BIT Docked "+this.name+" to "+partner.name+" pdom="+snap.paired.domain);
		if( this.ctrl != null){
			this.ctrl.dock(partner, snap.paired.domain);
		}
	}

	this.dockto = function(partner, dom)
	{
//		debugmsg("BIT dockto "+this.name+" -> "+partner.name);
		if( this.ctrl != null){
			this.ctrl.dockto(partner, dom);
		}

	}

	// bit input / output
	this.undock = function(partner)
	{
//		debugmsg("BIT Undock "+this.name+" from "+partner.name);
		if( this.ctrl != null ){
			this.ctrl.undock(partner);
		}
	}

	this.undockfrom = function(partner, dom)
	{
//		debugmsg("BIT Undock from "+this.name+" <- "+partner.name);
		if( this.ctrl != null){
			this.ctrl.undockfrom(partner, dom);
		}
	}

	// flip a bit between portrait and landscape
	// returns false if cannot flip bit
	//
	this.flip = function()
	{
		const btmp = this.btype & 7;
		const idx = this.btype - btmp;

		if( this.isDocked() ){
			return false;
		}

		if( btmp == 0){
			this.btype = idx + 1;
		}else if( btmp == 1){
			this.btype = idx;
		}
		this.setOrientation( this.btype & 1);

		this.setSnaps();

		return true;
	}

	// bit
	this.Animate = function( t)
	{
		if( t > 9){
			t = 9;
		}
		t = 9 - t
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00ff00";
        ctx.strokeRect(this.x+t, this.y+t, this.w-t-t, this.h-t-t);
	}

	this.getDrag = function()
	{
		return this;
	}

// bit
	this.findSnap = function()
	{	var res = this;
		return null;
	}

	this.print = function()
	{	let msg = "bit "+this.bitname+"("+this.code+") ";
		let i;
		const len = this.snaps.length;

		msg += "["+this.x+","+this.y+","+this.w+","+this.h+","+this.initw+","+this.inith+"] ";

		for(i=0; i < len; i++){
			if( this.snaps[i] != null){
				msg = msg + i+":";
				if( this.snaps[i].paired != null){
					msg = msg + this.snaps[i].paired.bit.code;
				}
				msg+= " ";
			}
		}
		msg += "<br />\n";
		return msg;
	}

	this.autoSelect = function(arx, ary)
	{	let tx = arx;
		let ty = ary;
		let xsnap = null;
		let abt = this.btype & 7;
		let snaporder = [0, 1, 2, 3];

		if( abt == 1){
			snaporder = [2, 3, 0, 1];
		}

		if( tx < 0){
			tx = 0 - tx;
		}

		if( ty < 0){
			ty = 0 - ty;
		}

		if( tx < 1 && ty < 1){
			// not moved enough
			return;
		}

		if( tx > 2*ty){
			// horizontal motion
			if( arx < 0 ){
				xsnap = this.snaps[ snaporder[0] ];
			}else {
				xsnap = this.snaps[ snaporder[1] ];
			}
		}else if( ty > 2*tx){
			// vertical motion
			if( ary < 0 ){
				xsnap = this.snaps[snaporder[2] ];
			}else {
				xsnap = this.snaps[snaporder[3] ];
			}
		}
		if( xsnap != null && xsnap.paired == null){
			selected = xsnap;
			scanning = xsnap;
		}		
	}

	// used by reLabel
	//
// bit
	this.markConnected = function( n )
	{	let i;
		let s, p;
		const len = this.snaps.length;

		this.net = n;
		for(i=0; i < len; i++){
			s = this.snaps[i];
			if( s != null ){
				p = s.paired;
				if( p != null && p.bit != null && p.bit.net == 0){
					// mark the unmarked attached bits.
					p.bit.markConnected(n);
				}
			}
		}
//		debugmsg("Mark "+n+" "+this.name+" chain "+this.chain);
	}

	// used when drawing setxylinked relxylinked 
	//
// bit
	this.unMark = function( )
	{ let i;
	  let s;
	  const len = this.snaps.length;

		if( this.mflag != 0){
			this.mflag = 0;
			for(i=0; i < len; i++){
				s = this.snaps[i];
				if( s != null ){
					p = s.paired;
					if( p != null && p.bit != null ){
						// nmarked attached bits.
						p.bit.unMark();
					}
				}
			}
		}
	}

	// bit
	this.setValue = function(data, chan)
	{

	}

	// bit
	this.getValue = function(chan)
	{	if(chan == 0){
			return this.value;
		}
		return this.value2;
	}



}

function Bitlist( xbit )
{
	this.next = null;
	this.prev = null;
	this.bit = xbit;
	this.num = 0;		// used by save / load

	this.addBit = function(bitl)
	{
		bitl.next = this.next;
		this.next = bitl;

		bitl.prev = this;
		if( bitl.next != null){
			bitl.next.prev = bitl;
		}
		return bitl;
	}

	this.delBit = function()
	{ 
		if( this.prev != null){
			this.prev.next = this.next;
		}
		if( this.next != null){
			this.next.prev = this.prev;
		}
		return this;
	}

	this.print = function()
	{	var msg="Bitlist=<br />";
		var t;



		if( this.next == null){
			msg += " - ";
		}else{
			msg += " + ";
		}
		if( this.prev == null){
			msg += " - ";
		}else{
			msg += " + ";
		}
		if( this.bit == null){
			msg += " - ";
		}else{
			msg += " + ";
		}
		msg += "<br />";

		for(t = this.next; t != null; t = t.next){
			if( t.next == null){
				msg += " - ";
			}else{
				msg += " + ";
			}
			if( t.prev == null){
				msg += " - ";
			}else{
				msg += " + ";
			}
			if( t.bit == null){
				msg += " - ";
			}else{
				msg += " + ";
			}
			msg += "<br />";

		}
		message(msg);
	}
}

function reLabel( bl)
{	let l = bl;
	let n = 0;

	// part 1. set net to 0
	while( l != null){
		l.bit.net = 0;
		l = l.next;
	}

	// part 2. mark all connected bits with the same net number.
	l = bl;
	while( l != null){
		if( l.bit.net == 0){
			n++;
			l.bit.markConnected(n);
		}
		l = l.next;
	}
	// message("reLabel "+n);
}

function Keyboard(){

	this.KeyPress = function( code, up)
	{	let i;
		let bit = null;

		if( up != 0){
			up = 127;
		}

		if( bitformaction != null){
			bit = bitformaction.bit;
			if( bit != null){
				ctrl = bit.ctrl;
				ctrl.keyPress(code, up);
			}
		}


	}
}

function Sketch() {
	this.blist = null;			// list of bits.
	this.bll = 0;
	this.blr = 0;
	this.blt = 0;
	this.blb = 0;
	this.bitvisible = 0;			// how many bits can be seen in the window.
	this.start = 0;

	this.drawText = function(bit, msg)
	{
        if (!this.canvas || !this.canvas.getContext) {
            return false;
        }
        ctx = this.canvas.getContext('2d');

		ctx.save();
		ctx.font="18px Georgia";
		bit.drawText( ctx, msg);
		ctx.restore();
	}


	this.drawData = function(bit)
	{
        if (!this.canvas || !this.canvas.getContext) {
            return false;
        }
        ctx = this.canvas.getContext('2d');

		ctx.save();
		ctx.font="12px Georgia";
		bit.drawData( ctx);
		ctx.restore();
	}

// sketch.draw()
    this.Draw = function() 
	{	let cx, cy;
		let ix, iy;
		let i;

        if (!this.canvas || !this.canvas.getContext) {
            return false;
        }
		if( getimagemap){
			return false;
		}
		drawing = 1;
        ctx = this.canvas.getContext('2d');

		cx = this.canvas.width;
		cy = this.canvas.height;

		// draw the background
		for(ix = 0; ix < cx; ix += 100){
			for(iy = 0; iy < cy; iy += 100){
		        ctx.drawImage(background, ix, iy);
			}
		}
		indicator_spin(4);
		drawIndicator();
		let pass;
		for(pass=0; pass < 4; pass++){
	        for (i = this.blist ; i != null ; i = i.next) {
				i.bit.Draw(pass);

				if( pass == 3){
					if( i.bit.bitname == "default" || i.bit.bitname == "defaulta"){

						this.drawText( i.bit, i.bit.name );
					}
					if( i.bit.chain != 0){
						this.drawData( i.bit );
					}
				}
			}
		}

		if( dragging != null){
			dragging.Draw(0);
			dragging.Draw(1);
			dragging.Draw(2);
			dragging.Draw(3);
		}
    }

	// sketch.drawProgram
	this.drawProgram = function()
	{
		softprogram.drawProgram( );
	}

// sketch
    this.doMouseDown = function() {
		let abit = null;
		let tmp;
		let i;
		if( hidetouch){
			UIhidetouch();		// free up screen space
		}

		if( selected != null){
			abit = selected.getDrag();
			if( !abit.isDocked() ){
				tmp = abit.hitHandle( mx, my);
				if( tmp == 1 ){
					bitFlip();
					return false;
				}else if( tmp == 2){
					bitRemove();
					sketch.drawProgram();
					return false;
				}
			}

			if( abit.ctrl != null){
				abit.ctrl.getData();
			}
		}
		if( bitform != null){
			// clearbitform = 0;
			doBitFormAction();
		}
		selected = null;
		dragging = null;
		docktarget = null;
		scanning = null;
		startX = mx;
		startY = my;
		curctrl = null;

		// DEBUG sketch.blist.print();

		i = sketch.blist ;
        while( i != null ) {
			abit = i.bit.HitTest(mx, my);
			if( abit != null){
				abit.setDxDy(mx, my);			// get the dx and dy for dragging
				dragging = abit.getDrag();

				selected = abit;
				scanning = abit.findSnap();
				if( scanning != null){
					docktarget = scanning.paired;
					if( docktarget != null){
						if( docktarget.bit.code != WIRE &&
							scanning.bit.code != WIRE){
							scanning.unDock();		// unlink the snap
						}else {
							scanning.unDock();		// unlink the snap
						}
						sketch.drawProgram();
					}
				}
				if( dragging == selected ){		// autosel
					autosel = dragging;
					autox = mx;
					autoy = my;
				}
			}
// && i.bit.isDocked()
			if( curctrl == null && i.bit.ctrl != null  ){
				curctrl = i.bit.ctrl.HitTest(mx, my);
				if( curctrl != null){
					curctrl.startMove(mx, my);
					selected = null;			// dont animate
					scanning = null;			// not a snap
					dragging = null;			// not dragging
					i = null;
				}
			}
			// dragging is always the bit.
			// selected can be the bit or snap
			if( dragging != null && dragging.ctrl != null){
				dragging.ctrl.setData();
			}
			if( abit != null){
				i = null;
			}
			if( i != null){
				i = i.next;
			}
		}
		if( abit == null){
			sx = mx;	// drag all.
			sy = my;
			docking = null;		// cancel any docking...
		}
		if( dragging != null){
			document.getElementById("canvasbox").style.cursor = "help"; // debugging..
		}

		indicator(255, 2);
        return false;
    }

    this.MouseDown = function(e) {

        document.getElementById("canvas").focus();
        getXY(e);

		return sketch.doMouseDown();
	}

// sketch
    this.doMouseMove = function() 
	{	let res;
		let cw, ch;
		let ahit;
		let cname = "default";
		let ldrag = dragging;
		let i;

		indicator(0, 0);
		indicator(0, 1);
		indicator(0, 3);

//		message("Mouse Move "+mx+" "+my);
		cw = sketch.canvas.width;
		ch = sketch.canvas.height;

		if( mx < 5 || mx > cw-5 ||
			my < 5 || my > ch-5){
			// mouse outside canvas
			dragging = null;
			curctrl = null;
			sx = 0;
			sy = 0;
//			message("Outside "+cw+" "+ch);
			return;
		}

		// looking for dragging wire snap.
		// scaning == selected and dragging == wire
//		if( selected != null && scanning == selected && dragging != null && dragging.ctrl != null){
//			dragging.ctrl.doDrag(mx, my);
//		}
		if( selected != null && scanning == selected && dragging != null && dragging.ctrl != null){
			ldrag = dragging.ctrl.doDrag(mx, my);
			indicator(160, 3);
		}

		if( selected != null && scanning == null){
			ahit = selected.getDrag();
			if( !ahit.isDocked() ){
				tmp = ahit.hitHandle( mx, my);
				if( tmp == 1 ){
					cname = "sw-resize";
				}else if(tmp != 0){
					cname = "pointer";
				}
			}
			indicator(80, 0);
		}

		if( curctrl != null){
			curctrl.onMove(mx, my);
			sx = 0;				// if control selected then not dragging...
			sy = 0;
			ldrag = null;
			drawmode = 2;
			indicator(240, 0);
		}

		if( ldrag != null){
			if( mx < 50 ){
				mx = 50;
			}else if( mx > cw-50){
				mx = cw - 50;
			}
			if( my < 50 ){
				my = 50;
			}else if( my > ch-50){
				my = ch;
			}
			
			ldrag.setXYlinked(mx - dx, my - dy);
			ldrag.unMark();

			if( autosel != null){

				autosel.autoSelect( mx - autox, my - autoy);				
				autox = mx;
				autoy = my;
			}
			cname = "move";
			drawmode = 2;
			indicator(80, 1);

		}else if( sx != 0 && sy != 0){
			// pan 
			dx = mx - sx;
			dy = my - sy;
	        for (i = sketch.blist ; i != null ; i = i.next) {
				i.bit.relXY( dx, dy);
			}
			// check visibility
			sketch.getBounds();
			if( sketch.bitvisible <= 0){
				// undo move
				for (i = sketch.blist ; i != null ; i = i.next) {
					i.bit.relXY( -dx, -dy);
				}
			}else {
				sx = mx;
				sy = my;
			}
			cname = "all-scroll";
			drawmode = 2;
			indicator(255, 1);
		}else {
			i = sketch.blist;
			indicator(160, 1);
			while( i != null ) {
				ahit = i.bit.HitTest(mx, my);
				if( ahit != null){
					cname = "pointer";
					if( i.bit.ctrl != null){
						if( i.bit.ctrl.HitTest(mx, my)){
							cname = "crosshair";
						}
					}
					i = null;
				}else {
					i = i.next;
				}
			}
		}

		if( scanning){
			res = scanning.findTarget();
			if( res != scanning){
				docktarget = res;
			}
		}

//		doAnimate();	// refresh the display
		document.getElementById("canvasbox").style.cursor = cname;
    }

// sketch
    this.MouseMove = function(e) {
        getXY(e);
		return sketch.doMouseMove();
	}

// sketch
    this.doMouseUp = function() {
		let dockbit;
		let cw, ch;

		cw = sketch.canvas.width;
		ch = sketch.canvas.height;

		indicator(0, 2);

        //sketch.snaps.MouseUp(mx, my);
		if( docktarget != null && scanning != null){
			docking = dragging;
			// use scanning object to determine dockX and dockY
			dockX = docktarget.x - scanning.x;
			dockY = docktarget.y - scanning.y;

			dockbit = docktarget.getDrag();

			if( scanning.side == "-l"){
				dockX = dockX+15;
				if( repel){
				  dockX = dockX +50;
				}
			}else if( scanning.side == "-r"){
				dockX = dockX-15;
				if( repel){
				  dockX = dockX -50;
				}
			}else if( scanning.side == "-t"){
				dockY = dockY+15;
				if( repel){
				  dockY = dockY +50;
				}
			}else if( scanning.side == "-b"){
				dockY = dockY-15;
				if( repel){
				  dockY = dockY - 50;
				}
			}
			dockX = dockX + dragging.x;
			dockY = dockY + dragging.y;
		}
		if( dragging)
		{
			document.getElementById("canvasbox").style.cursor = "pointer";
		}

		dragging = null;
		autosel = null;
		sx = 0;
		sy = 0;

		if( curctrl != null){
			curctrl.stopMove();
		}

		sketch.getBounds();		// calculate the bounds for the bitlist.

    }

    this.MouseUp = function(e) {
        getXY(e);
		sketch.doMouseUp();
	}

    this.DblClick = function(e) {
    }

	// sketch.KeyDown
    this.KeyDown = function(e) {
        if (document.activeElement == document.getElementById("canvas")) {
            sketch.keyboard.KeyPress(e.keyCode, 1);
            return false;
        }
    }

    this.KeyUp = function(e) {
        sketch.keyboard.KeyPress(e.keyCode, 0);
    }

    this.KeyPress = function(e) {
        if (document.activeElement == document.getElementById("canvas")){
            return false;
		}
    }

	/////////////////////////////////////////////////////////////////////////////////////

	// sketch.addBit
	this.addBit = function( xbit)
	{	let bitl;

		bitl = new Bitlist( xbit);
//		bitl.bit = xbit;
		xbit.carrier = bitl;

		if( this.blist == null){
			this.blist = bitl;
		}else {
			this.blist.addBit( bitl);
		}
	}

	// sketch.delBit
	this.delBit = function( xbit)
	{
		if( xbit == null || xbit.carrier == null ){
			return 0;
		}
		if( xbit.isDocked() ){
//			message("Remove: bit is docked");
			return 0;
		}
		this.getBounds();
		if( this.bitvisible < 2){
//			message("Remove: cannot remove last visble bit");
			return 0;
		}
// ok to delete bit
		if( xbit == this.blist.bit){
			this.blist = this.blist.next;
//			message("First bit");
		}

		xbit.carrier.delBit();
		return 1;
	}

	// this function does two things
	// calculate the bounds of the bitlist
	// and makes sure atlest one bit is visible

	// sketch.getBounds
	this.getBounds = function()
	{	let b;
		let cw, ch;
		let bx, by;

		this.bll = 0;
		this.blr = 0;
		this.blt = 0;
		this.blb = 0;

		cw = this.canvas.width;
		ch = this.canvas.height;
		this.bitvisible = 0;

		b = this.blist;
		while( b != null){
			if( b.bit.name != "map"){
				bx = b.bit.x;
				by = b.bit.y;

				if( bx > 0 && bx < cw - 25 &&
					by > 0 && by < ch - 25){
					this.bitvisible++;
				}

				if( this.bll > bx){
					this.bll = bx;
				}else if( this.blr < b.bit.x+b.bit.w){
					this.blr = b.bit.x+b.bit.w;
				}

				if( this.blt > b.bit.y){
					this.blt = b.bit.y;
				}else if( this.blb < b.bit.y+b.bit.h){
					this.blb = b.bit.y+b.bit.h;
				}
			}
			b = b.next;
		}
	}


	// sketch.Init()
    this.Init = function() {
		var cw, ch;
		this.start = Date.now();
		let k;

		drawing = 1;
        background = document.getElementById("background");
		imagemap = document.getElementById("imagemap");

		k = kitlist;
		if( k != null){
			while(k != null){
				k.init();			// init each kit.
				k = k.next;
			}
		}

        logger = document.getElementById("logger");
        // bitform = document.getElementById("bitform");

		this.keyboard = new Keyboard();
		
        this.canvas = document.getElementById('canvas');
        this.canvas.onmousedown = this.MouseDown;
        this.canvas.onmousemove = this.MouseMove;
        this.canvas.onmouseup = this.MouseUp;
        this.canvas.ondblclick = this.DblClick;
		this.canvas.onkeyup = this.KeyUp;
		this.canvas.onkeydown = this.KeyDown;

		this.canvas.addEventListener('touchstart', function(e){
			let touchobj = e.changedTouches[0]; // reference first touch point (ie: first finger)
			let rect=this.getBoundingClientRect();
			let ox = rect.left + window.scrollX;
			let oy = rect.top + window.scrollY;
			if( hidetouch){
				UIhidetouch();
			}
			e.preventDefault();
			if( e.touches.length == e.targetTouches.length){
				mx = touchobj.pageX-ox;
				my = touchobj.pageY-oy;
				sketch.doMouseDown();
			}
			}, false);
 
		this.canvas.addEventListener('touchmove', function(e){
			var touchobj = e.changedTouches[0];
			let rect=this.getBoundingClientRect();
			let ox = rect.left + window.scrollX;
			let oy = rect.top + window.scrollY;
			if( hidetouch){
				UIhidetouch();
			}
			e.preventDefault();

			mx = touchobj.pageX-ox;
			my = touchobj.pageY-oy;
			sketch.doMouseMove();
		}, false);
 
		this.canvas.addEventListener('touchend', function(e){
			var touchobj = e.changedTouches[0] // reference first touch point for this event
			let rect=this.getBoundingClientRect();
			let ox = rect.left + window.scrollX;
			let oy = rect.top + window.scrollY;
			if( hidetouch){
				UIhidetouch();
			}
			e.preventDefault();

			mx = touchobj.pageX-ox;
			my = touchobj.pageY-oy;
			sketch.doMouseUp();
		}, false);
 

		document.getElementById("canvasbox").style.cursor = "default";

		cw = this.canvas.width;
		ch = this.canvas.height;

		softprogram = new Program();
		softprogram.Init();


		loadInitData(initdataonLoad);

//		message(window.location.protocol);

		if( window.location.protocol == "file:"){
			canNetwork = 0;
			let b = document.getElementById("loadbutton");
			b.disabled = true;
			b = document.getElementById("savebutton");
			b.disabled = true;
		}
    }
}


function doAnimate()
{
	if( drawing == 0){
		if( drawmode > 0){
			sketch.Draw();
			drawmode--;
		}
		if( selected != null){
			animatecolor = "#ff0000";
			selected.Animate( tick);
			drawmode = 2;
			animatecolor = "#ffffff";
		}
		if( docktarget != null){
			docktarget.Animate( tick);
			drawmode = 2;
		}
		drawing = 0;
	}
}

function doDocking()
{
	// move drag bit to docktarget
	rx = dockX - docking.x;
	ry = dockY - docking.y;

	if( rx > 4){
		rx = 4;
	}else if( rx < -4){
		rx = -4;
	}
	if( ry > 4){
		ry = 4;
	}else if( ry < -4){
		ry = -4;
	}

	if( rx != 0 || ry != 0){
		docking.relXYlinked(rx, ry);
		docking.unMark();
	}else {
		// arrived at location

		selected = selected.getDrag();
		docking = null;

		if( repel == 0){
			scanning.doDock(docktarget);
			modified = 1;

			sketch.drawProgram();

		}
		docktarget = null;
		scanning = null;

	}
}

var tock = 0;
var tock2 = 0;
var tock3 = 0;

function flash(a, b)
{
	if( tock2 < 50){
		return a;
	}
	return b;
}

function doTimer()
{	let rx = 0;
	let ry = 0;
	let now = performance.now();

	let t= timer_list.head;
	let tn = null;
	let tafter = null;

	while(t != null){
		tn = t.next;
		if( !t.ob.run(now) ){
			t.next = tafter;
			tafter = t;
		}else {
			t.obj = null;	// deref
		}

		t = tn;
	}
	timer_list.head = tafter;

	if( execmode > 0 || drawspeed == 1){
		softprogram.runProgram(now);
		if( execmode > 0){
			execmode--;
		}
	}

	tock++;
	if( tock >= 4*drawspeed){
		tock = 1;	// 

		if( docking != null){
			doDocking();
		}
		doAnimate();
		tick = tick + drawspeed;
		if(tick >= 10){
			tick = 0;
		}
	}

	tock2++;
	if(tock2 == 100){
		tock2 = 0;

		t = slowTimer_list.head;
		tafter = null;
		while(t != null){
			tn = t.next;
			if( !t.ob.run(now) ){
				t.next = tafter;
				tafter = t;
			}else {
				t.obj = null;	// deref
			}
	
			t = tn;
		}
		slowTimer_list.head = tafter;

		if( startSound ){
			t = audio_list.head;
			tafter = null;
			while(t != null){
				tn = t.next;
				if( !t.ob.setup() ){
					t.next = tafter;
					tafter = t;
				}else {
					t.obj = null;	// deref
				}
		
				t = tn;
			}
			audio_list.head = tafter;
		}
	}
}


function sketchinit() {
    sketch = new Sketch();
    sketch.Init();

	setInterval(doTimer, 10);
}


// find bit N in the bitlist
function initFindBit( i)
{	let bl;
	bl = sketch.blist;
	while( bl != null){
		if( bl.num == i){
			return bl.bit;
		}
		bl = bl.next;
	}
	// not found
	debugmsg("Initfind not found "+i);
	bl = sketch.blist;
	while( bl != null){
		debugmsg("Initfind bit "+bl.num+" != "+i);
		bl = bl.next;
	}

	return bl.bit;
}

// find bit N in the initdata
function initFindTab(initdata, i, n)
{	let idx = i;
	let len = initdata[i-1];
	let obj = i;
	idx++;

//	debugmsg("initFindtab "+i+" "+n+" "+initdata[i]);

	while( idx < initdata.length && initdata[idx+1] != n){
		if( initdata[idx] == "bit" ){
			idx += 10 + initdata[idx+10] +1;
		}else if( initdata[idx] == "kit"){
			idx += 3;
		}
	}
	return idx;
}

function loadInitData( initdata)
{	let i,j, num;
	let bl;
	let bit, bit2;
	let nbit;
	let idx;
	let opt;
	let bt;
	let len;
	let obj;
	let next = initdata.length;

	// pass 1 create the bits.
	num = 1;
	sketch.blist = null;

	if(curkit == null){
		curkit = findkit("Basic");
	}

	obj = 0;
	len = initdata[obj];
	i = obj+1;
	next = obj+len;
	while( len > 0 && i < initdata.length){
//		if( len > 1){
//			debugmsg("INIT["+initdata.length+"] len="+len+" obj="+obj+" "+initdata[i]);
//		}else {
//			debugmsg("INIT["+initdata.length+"] len="+len+" obj="+obj);
//		}
		if( len > 1 && initdata[i] == "kit"){
			UIchooseKit(initdata[i+1]);
			i += 2;
		}else if( len > 10 && initdata[i] == "bit"){
			idx = initdata[i+3];
			bt = idx & 7;
			idx = idx - bt;

			nbit = new Bit(idx, initdata[i+4], initdata[i+5], curkit.bitnames[idx+2], curkit.bitnames[idx+3], curkit);
			if( bt == 1){
				nbit.flip();
			}

			bl = new Bitlist(nbit);
			bl.num = num;
			bl.next = sketch.blist;
			if( sketch.blist != null){
				sketch.blist.prev = bl;
			}
			sketch.blist = bl;
			nbit.carrier = bl;

			if( bitform != null){
				bitform.innerHTML = "";
				bitform = null;
				bitformaction = 0;
			}
			ctrllen = initdata[i+10];
			if( ctrllen > 1){
				// decode control
//				debugmsg("Load control "+ctrllen);
				ctrl = curkit.addCtrl( nbit);
			}
//			debugmsg("CTRLLEN "+ctrllen+" "+obj);
			next += ctrllen -1;			// bit counts the ctrllen.
			num++;
		}else if( len > 1 && initdata[i] == "end"){
			debugmsg("INIT end");
		}else if( len > 1 && initdata[i] == "options"){
			debugmsg("INIT options");
		}else if( len > 2 ){
//			message("Bad load data, expected 'bit' got "+initdata[i] +" len="+len);
			return;
		}
		obj = next;
		len = initdata[obj];
		next = obj+len;
		i = obj+1;
	}

	// pass 2 link the bits.
	obj = 0;
	len = initdata[obj];
	i = obj+1;
	next = obj+len;
	while(len > 0 && i < initdata.length){
		if( initdata[i] == "kit"){
			curkit = findkit(initdata[i+1]);
			i += 2;
		}else if( initdata[i] == 'bit'){
			num = initdata[i+1];
			bit = initFindBit( num);
			if( initdata[i+6] != 0){
				bit2 = initFindBit( initdata[i+6]);
				idx = initFindTab( initdata, 0, initdata[i+6]);
				for(j=0; j < 4; j++){
					if( initdata[idx+6+j] == num){
						// snap j is linked to bit.snaps[0]
						bit.snaps[0].paired = bit2.snaps[j];
						bit2.snaps[j].paired = bit.snaps[0];
					}
				}
			}
			if( initdata[i+8] != 0){
				bit2 = initFindBit( initdata[i+8]);
				idx = initFindTab( initdata, 0, initdata[i+8]);
				for(j=0; j < 4; j++){
					if( initdata[idx+6+j] == num){
						// snap j is linked to bit.snaps[2]
						bit.snaps[2].paired = bit2.snaps[j];
						bit2.snaps[j].paired = bit.snaps[2];
					}
				}
			}

			if( bit.ctrl != null){
				bit.ctrl.doLoad( initdata, i+10);
				// do dock logic.
				if( bit.snaps[0] != null){
					bit.snaps[0].doDock(bit.snaps[0].paired);
				}
			}
			ctrllen = initdata[i+10];
			next += ctrllen -1;			// bit counts the ctrllen.
		}
		// next
		obj = next;
		len = initdata[obj];
		next = obj+len;
		i = obj+1;
	}
	if( initdata[i] == "options"){
		showchains = initdata[i+1];
		showprogram= initdata[i+2];
		showcode = initdata[i+3];
		i += 4 + initdata[i+4];
	}

	opt = document.getElementById("showchains");
	opt.checked = showchains;
	opt = document.getElementById("showprogram");
	opt.checked = showprogram;
	opt = document.getElementById("showcode");
	opt.checked = showcode;
	modified = 0;

	if( bitform != null){
		bitform.innerHTML = "load init data";
		bitform = null;
		bitformaction = 0;
	}
	drawing = 0;
	curctrl = null;
	selected = null;
	dragging = null;
	docktarget = null;
		
	sketch.getBounds();

	reLabel(sketch.blist);

	softprogram.drawProgram();
}


