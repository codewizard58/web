// 10/19/24
////////////////////////////////////////////////////////////////////////////
var flipimg = 0;
var flipvimg = 0;
var removeimg = 0;
var knobimg = 0;
var knobvimg = 0;
var wirelinimg = 0;
var wiretinimg = 0;
var wireroutimg = 0;
var wireboutimg = 0;
var defaultimg = 0;
var seqimg = 0;
const none = null;
var trace = 0;
// 10/27/24
var activedomains = 1;		// which domains are active  1 == basic, 2 = sound, 4 = midi
var hidetouch = true;		
var curtab = "progtab";

const POWERON=0;
const POWEROFF=1;
const MIDICV=4;
const MIDICC=5;
const MIDICVOUT=6;
const MIDICCOUT=7;
const AINVERT = 13;
const DIMMER = 14;
const ENDPROG=255;
const WIRE = 109;
const CORNER = 110;
const ROTARY = 114;
const GRAPH = 115;
const OSC = 120;
const SPEAKER = 121;
const FILTER = 122;
const SEQUENCER = 123;
const SCOPE = 124;
const MICROPHONE = 125;
const DELAY = 126;

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
		message("Flip: flipped!");
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
		rem.ctrl.getData();
		rem.ctrl.onRemove();
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

	nbit = new Bit(idx, x, y, k.bitnames[idx+2], k.bitnames[idx+3], k);
	sketch.addBit( nbit );

	if( selected != null){
		d = selected.getDrag();
		if( d != null  && d.ctrl != null){
			d.ctrl.getData();
		}
	}
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
	}

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
	{	var bt;
		var idx;
		var code;

		if( bit == null){
			return;
		}
		bt = bit.btype & 7;
		idx= bit.btype - bt;
//		code = idx / 8;
		code = bit.code;

		this.codebits[this.codeptr] = bit;
		bit.addr = this.codeptr;
		this.addCode( code);

	}

	this.codeBit1 = function(bit, arg1)
	{	var bt;
		var idx;
		var code;

		if( bit == null){
			return;
		}
		bt = bit.btype & 7;
		idx= bit.btype - bt;
		code = bit.code;

		this.codebits[this.codeptr] = bit;
		bit.addr = this.codeptr;
		this.addCode( code);	
		this.addCode( arg1);	
	}

	this.codeBit2 = function(bit, arg1, arg2)
	{	var bt;
		var idx;
		var code;

		if( bit == null){
			return;
		}
		bt = bit.btype & 7;
		idx= bit.btype - bt;
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
{
	return "Bit("+(idx+1)+")"  + "();<br>\n";
}

function drawFunction1(idx, arg1)
{
	return "Bit("+(idx+1)+")" + "(" + arg1 + ");<br>\n";
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
		var bit = snxt.bit;
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
		snxt.paired = nbit.snaps[1];

		nbit.snaps[0].paired = p;
		nbit.snaps[1].paired = snxt;

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
			bpair = this.getPair( bit.snaps[1]);
			xsnap = bit.snaps[1];		// remember which snap bpair is associated with

			// look for wire recv			
			if( bpair != null){
				code = bpair.code;
			}
			// look for output sends..
			if(  bit.snaps[3] != null && bit.snaps[3].paired != null){
				bpair2 = bit.snaps[3].paired.bit;

				// need a temp power on for the send chain.
				nbit = this.insertTempPowerOn( bit.snaps[3].paired);

				nbit.chain = 0;

				this.markChain(nbit);
			}

			// make sure that this chain is not a side chain of the next bit
			if( bpair != null && bpair.snaps[2] == bit.snaps[1].paired){
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
		//				if( j == 8){
		//					msg += "<br />\n";
		//					j = 0;
		//				}
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
			if( b.code == CORNER){
				stail = b.snaps[3];
			}else {
				stail = b.snaps[1];
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
	{	let pon;
		let b;
		let tlnxt;
		let msg="";
		let bit;
		let whead, wtail;
		let ahead, atail;
		let idx;
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
			
			if( bit.code == POWERON || bit.code == MIDICV || bit.code == MIDICC || bit.code == MICROPHONE){
				// a power_on
				this.markChain(bit);
			}
			b = b.next;
		}

		// PASS 2
		b = sketch.blist;
		while(b != null){
			bit = b.bit;
			
			if( bit.code == POWERON || bit.code == MIDICV || bit.code == MIDICC || bit.code == MICROPHONE){
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
			if( code == POWERON || code == MIDICV || code == MIDICC || code == MICROPHONE){		// power on
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

	this.runProgram = function()
	{	var i=0;

		var prog = this.current;
		var progbits = this.currentbits;

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
	this.execProgram = function(prog, progbits)
	{	let curchain = 0;
		let chain = 0;
		let bp = 0;
		let code = 0;
		let ibp = 0;
		let arg = 0;
		let arg2, arg3;
		let data = 0, data2;
		let nchains = 20;
		let rchain = curchain;	// result chain
		let rdata = data;
		let osnap = null;

		this.needsend = 0;	
		this.sendsize = 8;		// allow for 0xf0 S B P 0x06 seqh seql ver

		while( prog != null){
			ibp = bp;
			code = prog[bp];
			bp++;
			if( curchain > 0 && curchain < nchains){
				data = this.chains[ curchain].data;
			}
			if( progbits[ibp] != null && progbits[ibp].snaps[1] != null){
				osnap = progbits[ibp].snaps[1];
			}
			// first few codes run even if curchain is 0
			if( code == POWERON){			// power on
				chain = prog[bp];
				bp++;
				if( chain < 0 || chain >= nchains){
					prog = null;
				}else {
					curchain = chain;
					data = this.chains[curchain].startvalue;
					this.chains[ curchain].data = data;
				}
			}else if(code == ENDPROG){
				prog = null;		// end of program
			}else if( code == MIDICV || code == MIDICC || code == MICROPHONE){			// midicv is power on
					chain = prog[bp];
					bp++;
					if( chain < 0 || chain >= nchains){
						prog = null;
					}else {
						curchain = chain;
						data = this.chains[curchain].startvalue;
						this.chains[ curchain].data = data;
					}
					if( curchain != 0){
						this.chains[ curchain].data = this.getValue( progbits, ibp, 255);
					}
			}else {
				if(code == SPEAKER){		// speaker
					arg2 = prog[bp];
					bp++;
					if(curchain  == 0){
						data = 0;			// silence speaker if not linked in a chain.
					}else if(  arg2 > 0 && arg2 < nchains){		// modmix ?
						data2 = this.getchaindata(arg2, nchains);
						progbits[ ibp].ctrl.setValue(data2, 1);
					}else {
						progbits[ ibp].ctrl.setValue(128, 1);
					}
					progbits[ ibp].ctrl.setValue(data, 0);		// mute ?
					progbits[ibp].value = this.chains[ curchain].data;
				}else if(code == MIDICVOUT){		// midi note out
					arg2 = prog[bp];
					bp++;
					if(curchain  == 0){
						data = 0;			// note off when disconnected.
					}else if(  arg2 > 0 && arg2 < nchains){		// modmix ?
						data2 = this.getchaindata(arg2, nchains);
						progbits[ ibp].ctrl.setValue(data2, 1);	// modulation
					}
					progbits[ ibp].ctrl.setValue(data, 0);		
					progbits[ibp].value = this.chains[ curchain].data;

///////////////////////////////////////////////////////////////////////////////////////////////////////
		// these codes do not run if curchain == 0.
		// two byte codes. 
				}else if(code == 12){	// wire_split
					arg2 = prog[bp];
					bp++;
					if( curchain != 0){
						this.setchaindata(arg2, nchains, data);
					}
				}else if(code == 103){	// piano
					arg2 = prog[bp];
					bp++;
					if( curchain != 0){
						this.chains[ curchain].data = this.getValue( progbits, ibp, 255);
						if(  arg2 > 0 && arg2 < nchains){
							if( this.chains[ curchain].data != 0){
								this.chains[ arg2 ].startvalue = 255;
							}else {
								this.chains[ arg2 ].startvalue = 0;
							}
						}
					}
				}else if(code == 16){	// and
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 = this.getchaindata(arg2, nchains);
						if( data > 127 && data2 > 127){
							this.chains[ curchain].data = 255;
						}else {
							this.chains[ curchain].data = 0;
						}
						osnap.indcolor = "#00ff00";
						osnap.indval = this.chains[ curchain].data;
					}
				}else if(code == 19){	// nand
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);
						if( data > 127 && data2 > 127){
							this.chains[ curchain].data = 0;
						}else {
							this.chains[ curchain].data = 255;
						}
						osnap.indcolor = "#00ff00";
						osnap.indval = this.chains[ curchain].data;
					}
				}else if(code == 17){	// or
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);
						if( data > 127 || data2 > 127){
							this.chains[ curchain].data = 255;
						}else {
							this.chains[ curchain].data = 0;
						}
						osnap.indcolor = "#00ff00";
						osnap.indval = this.chains[ curchain].data;
					}
				}else if(code == 20){	// Nor
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						// 
						data2 =  this.getchaindata(arg2, nchains);
						if( data > 127 || data2 > 127){
							this.chains[ curchain].data = 0;
						}else {
							this.chains[ curchain].data = 255;
						}
						osnap.indcolor = "#00ff00";
						osnap.indval = this.chains[ curchain].data;
					}

				}else if(code == 42){	// Xor
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);
						if( data > 127 && data2 > 127){
							this.chains[ curchain].data = 0;
						}else if( data <= 127 && data2 <= 127){
							this.chains[ curchain].data = 0;
						}else {
							this.chains[ curchain].data = 255;
						}
						osnap.indcolor = "#00ff00";
						osnap.indval = this.chains[ curchain].data;
					}

				}else if(code == 23){	// midi_gate	
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0 ){
						this.chains[ arg2 ].startvalue = data;
					}
				}else if(code == 24){	// midi_cc	
					arg2 = prog[bp];
					bp++;
					arg3 = prog[bp];
					bp++;
					if( curchain != 0){
						if(arg3 > 0 && arg3 < nchains){
							this.chains[ arg3 ].startvalue = data;
						}
					}
				}else if(code == 36){	// plus
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);
						data = data+data2;
						data = checkRange(data);
						this.chains[ curchain].data = data;
					}
					osnap.indcolor = "#ffffff";
					osnap.indval = this.chains[ curchain].data;

				}else if(code == 37){	// minus
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);
						data = data-data2;
						data = checkRange(data);
						this.chains[ curchain].data = data;
					}
					osnap.indcolor = "#ffffff";
					osnap.indval = this.chains[ curchain].data;

				}else if(code == 38){	// times
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);
						data = data * data2;
						data = checkRange(data);
						this.chains[ curchain].data = data;
					}
					osnap.indcolor = "#ffffff";
					osnap.indval = this.chains[ curchain].data;

				}else if(code == 39){	// divide
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);
						if( data2 != 0){
							data = data * 128;
							data = Math.floor(( data / data2) / 128);
						}else {
							data = 255;
						}
						data = checkRange(data);
						this.chains[ curchain].data = data;
						osnap.indval = this.chains[ curchain].data;
					}
					osnap.indcolor = "#ffffff";

				}else if(code == 41){	// diff
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);
						if( data > data2){
							data = data - data2;
						}else {
							data = data2 - data;
						}

						data = checkRange(data);
						this.chains[ curchain].data = data;
						osnap.indcolor = "#ffffff";
						osnap.indval = this.chains[ curchain].data;
					}else {
						osnap.indcolor = "";
					}

				}else if(code == 43){	// compare
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);

						if( data > data2){
							data = 255;
						}else {
							data = 0;
						}
						this.chains[ curchain].data = data;
						osnap.indcolor = "#ffffff";
						osnap.indval = this.chains[ curchain].data;
					}else {
						osnap.indcolor = "";
					}

				}else if(code == 44){	// latch
					arg2 = prog[bp];
					bp++;
					if(arg2 == 0){
						curchain = 0;
					}
					if( curchain != 0){
						data2 =  this.getchaindata(arg2, nchains);
						if( data2 > 127 && progbits[ ibp].prevvalue < 128){
							progbits[ ibp].value = data;
						}
						data = progbits[ ibp].value;
						progbits[ ibp].prevvalue = data2;

						if( data > 128){
							data = 255;
						}else {
							data = 0;
						}
						this.chains[ curchain].data = data;
						osnap.indcolor = "#00ff00";
						osnap.indval = this.chains[ curchain].data;
					}else {
						osnap.indcolor = "";
					}

				}else if( code == 107){		// wire send 0x6b
					arg2 = prog[bp];
					bp++;
					if( curchain != 0 && this.prevdata[arg2] != data){
						if( this.senddata != null){
							this.senddata[this.sendsize] = arg2 & 0x7f;
							this.senddata[this.sendsize+1]= Math.floor(arg2 / 128);
							this.senddata[this.sendsize+2] = data & 0x7f;
							this.senddata[this.sendsize+3]=  Math.floor(data / 128);
						}
						this.sendsize += 4;
						this.needsend = 1;
						osnap.indcolor = "#000000";
						osnap.indval = this.chains[ curchain].data;
					}
					// bit.data sent to the chain on the arduino
				}else if( code == 108){		// wire recv 0x6c
					arg2 = prog[bp];
					bp++;
					if( curchain != 0){
						if( arduino != null){
							if( arg2 > 0 && arg2 < 20){
								this.chains[ curchain].data = arduino.remdata[ arg2];
								this.needsend = 1;
							}
						}
						osnap.indcolor = "#000000";
						osnap.indval = this.chains[ curchain].data;
					}

				}else if(code == GRAPH){	// graph
					arg2 = prog[bp];
					bp++;
					if( curchain != 0){
						data2 = data;
						progbits[ ibp].ctrl.setValue(data, 0);
						if( arg2 > 0 && arg2 < 20){
							data2 = this.chains[ arg2].data;
							progbits[ ibp].ctrl.setValue(data2, 1);
						}

						osnap.indcolor = "#ffffff";
					}else {
						osnap.indcolor = "";
					}
					osnap.indval = this.chains[ curchain].data;
				}else if(code == MIDICCOUT){		// midi control code
					arg2 = prog[bp];
					bp++;
					if(curchain  == 0){
						data = 0;			// note off when disconnected.
					}else if(  arg2 > 0 && arg2 < nchains){		
						data2 = this.getchaindata(arg2, nchains);
						progbits[ ibp].ctrl.setValue(data2, 1);	// modulation
					}
					progbits[ ibp].ctrl.setValue(data, 0);	
					progbits[ibp].value = this.chains[ curchain].data;

				}else if(code == OSC){		// osc
					arg2 = prog[bp];
					bp++;
					data2 = data;
//						progbits[ ibp].ctrl.setValue(data, 0);
					if( arg2 > 0 && arg2 < 20){
						data2 = this.chains[ arg2].data;
						progbits[ ibp].ctrl.setValue(data2, 1);	// modfreq
					}
					if(curchain  == 0){
						data = 0;			// silence osc if not linked in a chain.
					}else {
						progbits[ ibp].ctrl.setValue(data, 0);
					}
					osnap.indcolor = "#ff0000";
					osnap.indval = this.chains[ curchain].data;
				}else if(code == FILTER){		// filter
					arg2 = prog[bp];
					bp++;
					data2 = data;
//						progbits[ ibp].ctrl.setValue(data, 0);
					if( arg2 > 0 && arg2 < nchains){
						data2 = this.chains[ arg2].data;
					}
					progbits[ ibp].ctrl.setValue(data2, 0);
					progbits[ibp].value = this.chains[ curchain].data;
//						this.chains[ curchain].data = this.getValue( progbits, ibp, 255);
					osnap.indcolor = "#ff0000";
					osnap.indval = this.chains[ curchain].data;
			}else if( curchain != 0){
					// single byte codes that do nothing when curchain is 0
					if(code == AINVERT){
						this.chains[ curchain].data = 255 - data;	// arith_invert
						osnap.indcolor = "#ffffff";
						osnap.indval = this.chains[ curchain].data;

					}else if(code == 18){	// not 
						if( data > 127){
							this.chains[ curchain].data = 0;
						}else{
							this.chains[ curchain].data = 255;
						}
						osnap.indcolor = "#00ff00";
						osnap.indval = this.chains[ curchain].data;

					}else if(code == DIMMER || code == ROTARY){	// dimmer or rotary
						this.chains[ curchain].data = Math.floor( ( data * this.getValue( progbits, ibp, 255) ) / 256);	// arith_dimmer
						osnap.indcolor = "#ffffff";
						osnap.indval = this.chains[ curchain].data;

					}else if(code == 15){
						this.chains[ curchain].data = this.getValue( progbits, ibp, 255);	// arith_setvalue

					}else if(code == 111){
						this.chains[ curchain].data = this.getValue( progbits, ibp, 255);	// arith_counter
						if( data > 128){
							progbits[ibp].value++;
						}else {
							progbits[ibp].value--;
						}
						if( progbits[ibp].value > 255){
							progbits[ibp].value = 0;
						}else if(progbits[ibp].value < 0){
							progbits[ibp].value = 255;
						}
						osnap.indcolor = "#ffffff";
						osnap.indval = this.chains[ curchain].data;

					}else if(code == 112 || code == 113){			// push switch or toggle switch
						if( this.getValue( progbits, ibp, 0) < 127){
							data = 0;
						}
						this.chains[ curchain].data = data;
						osnap.indcolor = "#00ff00";
						osnap.indval = this.chains[ curchain].data;

					}else if(code == 104){
						if( curnote != data){
							if( data == 0){
								noteOn(curnote, 0);
								curnote = 0;
							}else {
								curnote = data;
								noteOn(curnote, 127);
							}
						}
						osnap.indcolor = "#ffffff";
						osnap.indval = this.chains[ curchain].data;

					}else if(code == SEQUENCER){		// seq
						progbits[ibp].ctrl.setValue(data, 0);
						this.chains[ curchain].data = this.getValue( progbits, ibp, 255);
						osnap.indcolor = "#ffffff";
						osnap.indval = this.chains[ curchain].data;
					}else if(code == SCOPE){		// scope
						progbits[ibp].ctrl.setValue(data, 0);		// use setValue to animate
						progbits[ibp].value = this.chains[ curchain].data;
						osnap.indcolor = "#ff0000";
						osnap.indval = this.chains[ curchain].data;
					}else if(code == 21){
					}else if(code == 22){
					}else if(code == 25){
					}else if(code == 26){
					}else if(code == 27){
					}else if(code == 28){
					}else if(code == 29){
					}
				}
			}
			if( progbits != null && progbits[ibp] != null && curchain > 0 && curchain < 20){
				progbits[ibp].data = this.chains[curchain].data;		// update the value
			}
		}
		if( this.needsend != 0){
			this.sendsize++;
			if( this.senddata == null){
				this.senddata = new Uint8Array( this.sendsize);
				this.senddata[0] = 0xf0;
				this.senddata[1] = 0x53;
				this.senddata[2] = 0x42;
				this.senddata[3] = 0x4c;
				this.senddata[4] = 0x06;
				this.senddata[5] = seqh;
				this.senddata[6] = seql;
				this.senddata[7] = 1;
				this.senddata[this.sendsize -1] = 0xf7;
			}else {
				if( arduino != null && arduino.senddata == null){
					arduino.senddata = this.senddata;
					arduino.sendcnt = this.sendsize;
					this.senddata = null;
				}
			}
		}
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
	debugmsg("SNAP "+bit.name+" "+idx+" "+this.domain);

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
					if( res != null){
						if( res.side != oside){
							res = null;		// cannot dock with this one.
						}else if( res.paired != null){
							res = null;		// cannot dock with a docked one.
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
		t = 9 - t;

		if( repel == 1){
			ctx.strokeStyle = "#ff0000";
		}else{
			ctx.strokeStyle = "#ffffff";
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
	this.prevvalue = 255;
	this.net = 0;				// for labeling nets used in dock/undock.
	this.addr = 0;				// offset of this bit in the codebyte array. 
	this.bitimg = 0;
	this.bitname = "";
	this.kit = k;
	this.name = "unset";
	this.connected = 0;			// count of  connections.
	this.domain = 0;			// not set.

	let bt = (btype & 7);
	let bidx = btype-bt;


	// bit 
	this.setOrientation = function(bt)
	{
		if( bt == 0 ){
			this.w = this.initw;
			this.h = this.inith;
			this.coords = [ -15, 0, this.initw, 0, (this.w / 2) - 25, -10, (this.w / 2) - 25, this.inith ];
			this.suffix = [ "-l", "-r", "-t", "-b" ];
		}else if( bt == 1){
			this.h = this.initw;
			this.w = this.inith;
			this.coords = [ 0, -15, 0, this.initw, -15, (this.h / 2) - 25, this.inith, (this.h / 2) - 25 ];
			this.suffix = [ "-t", "-b", "-l", "-r" ];
		}
		// snaps
		let sn = 0;
		let sname = "";
		let btx = this.btype & 7;
		let bidx = this.btype - btx;
		let slen = 4;

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
		let iimg = findimage(name);
		if( iimg == null){
			debugmsg("bit.findimage "+name+" not found");
			iimg = 0;
		}
		return iimg;
	}

	this.setOrientation( bt);

	let imagename = this.kit.bitnames[bidx];
	this.bitimg =this.findImage(imagename);
	this.name = this.kit.bitnames[bidx+1];
	this.code = this.kit.findcode( this.name);
	this.bitname = imagename;
	this.domain = this.kit.bitnames[bidx+12];

	// message("New bit("+this.w+","+this.h+")" );

	let snapname="";
	let idx = this.btype - bt;
	let sw = 15;
	let sh = 50;

	if( bt == 1){
		sw = 50;
		sh = 15;
	}

	for(var i = 0; i < this.snaps.length; i++){
		snapname = this.snapnames[ i];
		if( snapname != null){
			if( i < 2){
			// in out
				this.snaps[i] = new Snap(this, this.suffix[i], this.x, this.coords[i+i], this.y,this.coords[i+i+1], sw, sh, i);
			}else{
			// in2 out2
				this.snaps[i] = new Snap(this, this.suffix[i], this.x, this.coords[i+i], this.y,this.coords[i+i+1], sh, sw, i);
			}
		}
	}

	debugmsg("Bit: "+ this.kit.name + " idx "+ idx + " name "+this.name+" img "+this.bitimg+" "+this.name+" domain "+this.domain.toString(16));

// bit addctrl
	this.addCtrl = function( idx)
	{	var cnum = idx/8;
		var i;
		var ct = null;

		ct = this.kit.addCtrl(this);
		debugmsg("Add Control: "+idx+" "+cnum+" name "+this.name+" "+this.code);
		return ct;

	}


	if( this.kit.bitnames[bidx] == "control" || this.kit.bitnames[bidx+9] == 1){
		this.addCtrl( bidx );
	}

	/// end of initialization

// bit  move the bit relative
	this.relXY = function( dx, dy)
	{	var i;

		this.x += dx;
		this.y += dy;
		 for(i=0; i < 4; i++){
			if( this.snaps[i] != null)this.snaps[i].relXY(dx, dy);
		}
	}

	// move bit and docked bits relative
	this.relXYlinked = function( dx, dy)
	{	// move paired bits
		var i;
		var s;
		var p;

		if( this.mflag == 0)
		{
			this.mflag = 1;	// mark me
			for(i=0; i < 4; i++){
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
	{	var dx, dy;

		dx = x - this.x
		dy = y - this.y;
		this.relXY( dx, dy);

	}


	this.setXYlinked = function( x, y)
	{	var dx, dy;

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
	this.HitTest = function(x, y)
	{	let res = null;
		let i;

		if( x >= this.x && x <= this.x+this.w &&
			y >= this.y && y <= this.y+this.h){
			res = this;
		}
		let slen = this.snaps.length;
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
		var idx = this.btype - btmp;

        ctx.fillStyle = "#000000";
		if( btmp == 0){
			ctx.fillText(msg, this.x+10, this.y+25 );
		}else {
			ctx.translate( this.x+15, this.y+10);
			ctx.rotate( Math.PI/2);
			ctx.fillText(msg, 0, 0 );
		}
	}

// bit drawdata
	this.drawData = function( ctx)
	{	var btmp = this.btype & 7;
		var idx = this.btype - btmp;

        ctx.fillStyle = "#000000";
		if( btmp == 0){
			ctx.fillText(""+this.data, this.x+this.w-30, this.y+this.h-10 );
		}else {
			ctx.translate( this.x+this.w-20, this.y+this.h-30);
			ctx.rotate( Math.PI/2);
			ctx.fillText(""+this.data, 0, 0 );
		}
	}

// bit.draw()
	this.Draw = function( pass)
	{	var snapname = null;
		const btmp = this.btype & 7;
		const idx = this.btype - btmp;
		let img = 0;

        if( pass == 0){
			img = this.bitimg;

//			debugmsg("Draw "+img+" x="+this.x);
			if( btmp == 0){
				ctx.drawImage(bitpics[ img ], this.x, this.y);
			}else {
				// -v version
				img = img+1;
				ctx.drawImage(bitpics[ img ], this.x, this.y);
			}
			if( this.chain != 0){
				// draw the power border
				if( showchains == 1){
					ctx.lineWidth = 2;
					ctx.strokeStyle = powerColors[this.chain];
					ctx.strokeRect(this.x-2, this.y-2, this.w+4, this.h+4);
				}
			}
		}else if( pass == 2){	// input snaps
			snapname = this.snapnames[0];
			if( this.code != WIRE || this.snaps[1].paired == null){		// wire then ctrl draws if paired.
				if( snapname != null){	
					ctx.drawImage(bitpics[snapname], this.x+this.coords[0], this.y+this.coords[1]);
					this.snaps[0].drawIndicator( this.suffix[0], this.x+this.coords[0], this.y+this.coords[1]);
				}
			}
			snapname = this.snapnames[2];
			if( snapname != null){	
				ctx.drawImage(bitpics[snapname], this.x+this.coords[4], this.y+this.coords[5]);
				this.snaps[2].drawIndicator( this.suffix[2], this.x+this.coords[4], this.y+this.coords[5]);
			}
		}else if( pass == 1){	// output snaps
			snapname = this.snapnames[1];
			if( this.code != WIRE || this.snaps[0].paired == null){		// wire
				if( snapname != null){
					ctx.drawImage(bitpics[snapname], this.x+this.coords[2], this.y+this.coords[3]);
					this.snaps[1].drawIndicator( this.suffix[1], this.x+this.coords[2], this.y+this.coords[3]);
				}
			}
			snapname = this.snapnames[3];
			if( snapname != null){
				ctx.drawImage(bitpics[snapname], this.x+this.coords[6], this.y+this.coords[7]);
				this.snaps[3].drawIndicator( this.suffix[3], this.x+this.coords[6], this.y+this.coords[7]);
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
				ctx.drawImage( bitpics[flipimg], this.x+this.w, this.y+this.h);
			}else {
				ctx.drawImage( bitpics[flipvimg], this.x+this.w, this.y+this.h);
			}
			ctx.drawImage( bitpics[removeimg], this.x-25, this.y-25);
		}

	}

// bit isDocked()
	this.isDocked = function()
	{	var i;

		for(i=0; i < 4; i++){
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

		debugmsg("BIT Docked "+this.name+" to "+partner.name+" pdom="+snap.paired.domain);
		if( this.ctrl != null){
			this.ctrl.dock(partner, snap.paired.domain);
		}
	}

	this.dockto = function(partner, dom)
	{
		debugmsg("BIT dockto "+this.name+" -> "+partner.name);
		if( this.ctrl != null){
			this.ctrl.dockto(partner, dom);
		}

	}

	// bit input / output
	this.undock = function(partner)
	{
		debugmsg("BIT Undock "+this.name+" from "+partner.name);
		if( this.ctrl != null ){
			this.ctrl.undock(partner);
		}
	}

	this.undockfrom = function(partner, dom)
	{
		debugmsg("BIT Undock from "+this.name+" <- "+partner.name);
		if( this.ctrl != null){
			this.ctrl.undockfrom(partner, dom);
		}
	}

	// flip a bit between portrait and landscape
	// returns false if cannot flip bit
	//
	this.flip = function()
	{
		var btmp = this.btype & 7;
		var idx = this.btype - btmp;
		var i, tmp;
		var nx, ny;

		if( this.isDocked() ){
			return false;
		}

		if( btmp == 0){
			this.btype = idx + 1;
			i = 1;
		}else if( btmp == 1){
			this.btype = idx;
			i = 0;
		}
		this.setOrientation( i);

		// re orientate the snaps
		var msg = "";
		for(i=0; i < 4; i++){
			if( this.snaps[i] != null){
				
				tmp = this.snaps[i].w;
				this.snaps[i].w = this.snaps[i].h;
				this.snaps[i].h = tmp;

				tmp = this.snaps[i].rx;
				this.snaps[i].rx = this.snaps[i].ry;
				this.snaps[i].ry = tmp;

				nx = this.x+this.coords[i+i];
				ny = this.y+this.coords[i+i+1];

				this.snaps[i].x = nx;
				this.snaps[i].y = ny;
				this.snaps[i].side = this.suffix[i];
			}
		}
		return true;
	}

	this.Animate = function( t)
	{
		t = 9 - t
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ff0000";
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
	{	var msg = "bit "+this.bitname+"("+this.code+") ";
		var i;

		msg += "["+this.x+","+this.y+","+this.w+","+this.h+","+this.initw+","+this.inith+"] ";

		for(i=0; i < 4; i++){
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
	{	var tx = arx;
		var ty = ary;
		var xsnap = null;
		var abt = this.btype & 7;
		var snaporder = [0, 1, 2, 3];

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
			// vertical mption
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
	{	var i;
		var s, p;

		this.net = n;
		for(i=0; i < 4; i++){
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
	{ var i;
	  var s;

		if( this.mflag != 0){
			this.mflag = 0;
			for(i=0; i < 4; i++){
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
{	var l = bl;
	var n = 0;

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
	var ix, iy;
	var idx;
	var blist = null;			// list of bits.
	var i;
	var bll, blr, blt, blb;		// bounds of bitlist net
	var bitvisible = 0;			// how many bits can be seen in the window.

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
	{	var cx, cy;

        if (!this.canvas || !this.canvas.getContext) {
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
		var pass;
		for(pass=0; pass < 4; pass++){
	        for (i = this.blist ; i != null ; i = i.next) {
				i.bit.Draw(pass);
				var bt = i.bit.btype & 7;
				var idx = i.bit.btype - bt;

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
		var ahit = null;
		var tmp;

		if( selected != null){
			ahit = selected.getDrag();
			if( !ahit.isDocked() ){
				tmp = ahit.hitHandle( mx, my);
				if( tmp == 1 ){
					bitFlip();
					return false;
				}else if( tmp == 2){
					bitRemove();
					sketch.drawProgram();
					return false;
				}
			}

			if( ahit.ctrl != null){
				ahit.ctrl.getData();
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
			ahit = i.bit.HitTest(mx, my);
			if( ahit != null){
				message("X="+ahit.x+" Y="+ahit.y);
				ahit.setDxDy(mx, my);			// get the dx and dy for dragging
				dragging = ahit.getDrag();

				if( dragging != null && dragging.code == WIRE){
					message("W "+dragging.print() );
				}

				selected = ahit;
				scanning = ahit.findSnap();
				if( scanning != null){
					docktarget = scanning.paired;
					if( docktarget != null){
						if( docktarget.bit.code != WIRE &&
							scanning.bit.code != WIRE){
							scanning.unDock();		// unlink the snap
						}else {
							message("un dock wire");
							scanning.unDock();		// unlink the snap
						}
						sketch.drawProgram();
					}
				}
				if( dragging == selected){		// autosel
					if( dragging.code != WIRE ){	// not wire...
						autosel = dragging;
						autox = mx;
						autoy = my;
						//message("Autoselect");
					}
				}
			}

			if( curctrl == null && i.bit.ctrl != null && i.bit.isDocked() ){
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
			if( ahit != null){
				i = null;
			}
			if( i != null){
				i = i.next;
			}
		}
		if( ahit == null){
			sx = mx;	// drag all.
			sy = my;
			docking = null;		// cancel any docking...
		}
		if( dragging != null){
			document.getElementById("canvasbox").style.cursor = "help"; // debugging..
		}

//		if( scanning != null){
//			message("Domain="+scanning.domain);
//		}
//		if( selected != null){
//			message("Domain="+selected.domain+" Chain="+selected.getDrag().chain);
//		}
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
		}

		// looking for dragging wire snap.
		// scaning == selected and dragging == wire
		if( selected != null && scanning == selected && dragging != null && dragging.code == WIRE){

			if( selected == dragging.snaps[0] ){
				if( dragging.snaps[1].paired != null){

					message("WI "+dragging.snaps[1].x+" "+mx+" "+dragging.print() );

//					if( docktarget == null){
						if( (dragging.btype & 1 ) == 0){
							if( dragging.snaps[1].x - mx-15 > 30 ){
								selected.x = mx;
							}else {
								selected.x = dragging.snaps[1].x-46;
							}
						}else {
							if( dragging.snaps[1].y - my - 15 > 30 ){
								selected.y = my;
							}else {
								selected.y = dragging.snaps[1].y-46;
							}
						}
//					}
					ldrag = null;
					dragging.ctrl.setBitSize( mx, my);
				}
			}else {
				if( dragging.snaps[0].paired != null){

					message("WO "+dragging.initw+" "+dragging.inith+" "+dragging.print() );

//					if( docktarget == null){
						if( (dragging.btype & 1 ) == 0){
							if( mx - dragging.snaps[0].x > 45){
								selected.x = mx;
							}else {
								selected.x = dragging.snaps[0].x+46;
							}
						}else {
							if(  my - dragging.snaps[0].y > 45 ){
								selected.y = my;
							}else {
								selected.y = dragging.snaps[0].y+46;
							}
						}
//					}
					ldrag = null;
					dragging.ctrl.setBitSize( mx, my);
				}
			}
//		}else {
//			message("");
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
		}

		if( curctrl != null){
			curctrl.onMove(mx, my);
			sx = 0;				// if control selected then not dragging...
			sy = 0;
			ldrag = null;
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
		}else {
			i = sketch.blist;
			while( i != null ) {
				ahit = i.bit.HitTest(mx, my);
				if( ahit != null){
					cname = "pointer";
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

		doAnimate();	// refresh the display
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

        //sketch.snaps.MouseUp(mx, my);
		if( docktarget != null){
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
	{	var bitl;

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
			message("Remove: bit is docked");
			return 0;
		}
		this.getBounds();
		if( this.bitvisible < 2){
			message("Remove: cannot remove last visble bit");
			return 0;
		}
// ok to delete bit
		if( xbit == this.blist.bit){
			this.blist = this.blist.next;
			message("First bit");
		}

		xbit.carrier.delBit();
		return 1;
	}

	// this function does two things
	// calculate the bounds of the bitlist
	// and makes sure atlest one bit is visible

	// sketch.getBounds
	this.getBounds = function()
	{	var b;
		var cw, ch;
		var bx, by;

		this.bll = 0;
		this.blr = 0;
		this.blt = 0;
		this.blb = 0;

		cw = this.canvas.width;
		ch = this.canvas.height;
		this.bitvisible = 0;

		b = this.blist;
		while( b != null){
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
			b = b.next;
		}
	}


	// sketch.Init()
    this.Init = function() {
		var nam;
		var cw, ch;

		drawing = 1;
        background = document.getElementById("background");

		k = kitlist;
		if( k != null){
			while(k != null){
				k.init();
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
				var touchobj = e.changedTouches[0]; // reference first touch point (ie: first finger)
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
			var b = document.getElementById("loadbutton");
			b.disabled = true;
			b = document.getElementById("savebutton");
			b.disabled = true;
		}
    }
}


function doAnimate()
{
	if( drawing == 0){
		sketch.Draw();
		if( selected != null){
			selected.Animate( tick);
		}
		if( docktarget != null){
			docktarget.Animate( tick);
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

function doTimer()
{	var rx = 0;
	var ry = 0;

	let j = joblist;
	if( j != null){
		while( j != null){
			if( j.done == false){
				// alert("Timer job "+j.name);
				j.run();
			}
			j = j.next;
		}
	}

	softprogram.runProgram();

	tock++;
	if( tock == 4){
		tock = 0;


		if( docking != null){
			doDocking();
		}
		doAnimate();
		tick++;
		if(tick == 10){
			tick = 0;
		}
	}

	tock2++;
	if(tock2 == 11){
		tock2 = 0;

		if( arduino != null){
	//		checkValues(sketch.blist);
	debugmsg("Out to arduino");
			if( seqmissmatch != 0){
				sketch.drawProgram();
				seqmissmatch = 0;
			}else{
				outBitValues();
			}
		}
	}
}

// from midi/processbase.js
timer_list.addobj( new softbitstimer(), null);

function softbitstimer()
{
	this.timer = function()
	{
		doTimer();
		return false;
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
{	var idx = i;
	let len = initdata[i-1];
	let obj = i;
	idx++;

	debugmsg("initFindtab "+i+" "+n+" "+initdata[i]);

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
	let bl, bp;
	let pair;
	let snap;
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
		if( len > 1){
			debugmsg("INIT["+initdata.length+"] len="+len+" obj="+obj+" "+initdata[i]);
		}else {
			debugmsg("INIT["+initdata.length+"] len="+len+" obj="+obj);
		}
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
				debugmsg("Load control "+ctrllen);
				ctrl = curkit.addCtrl( nbit);
			}
			debugmsg("CTRLLEN "+ctrllen+" "+obj);
			next += ctrllen -1;			// bit counts the ctrllen.
			num++;
		}else if( len > 1 && initdata[i] == "end"){
			debugmsg("INIT end");
		}else if( len > 1 && initdata[i] == "options"){
			debugmsg("INIT options");
		}else if( len > 2 ){
			message("Bad load data, expected 'bit' got "+initdata[i] +" len="+len);
			return;
		}
		obj = next;
		len = initdata[obj];
		next = obj+len;
		debugmsg("INIT next "+obj+" "+len);
		if( len > 2){
			debugmsg("____ next: "+initdata[obj+1]+" "+initdata[obj+2]);
		}
		i = obj+1;
	}
	debugmsg("End of pass["+initdata.length+"] 1: "+i+" len="+len+" obj="+obj);

	// pass 2 link the bits.
	obj = 0;
	len = initdata[obj];
	i = obj+1;
	next = obj+len;
	while(len > 0 && i < initdata.length){
		if( len > 1){
			debugmsg("PASS2 len="+len+" obj="+obj+" "+initdata[i]);
		}else {
			debugmsg("PASS2 len="+len+" obj="+obj);
		}
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


