/// sound bits
var roundknobimg = 0;
var notetab = null;
const notetabsize = 128;
var degree = Math.PI/180;

const A4 = 57;
const B4 = 59;
const C4 = 60;
const D4 = 62;
const E4 = 64;
const F4 = 65;
const A5 = 69;

var keyboardmap = 
[	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	// 00
	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	// 10
	256,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	// 20
	0,0,73,75,	0,78,80,82,	0,85,87,0,	0,0,0,0,	// 30

	0,0,67,64,	63,76,0,66,	68,84,70,0,	0,71,0,0,	// 40
	88,72,77,61,	79,83,65,74,	62,81,60,0,	0,0,0,0,	// 50
	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	
	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	

	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	
	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	
	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	
	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	

	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	
	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	
	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0,	
	0,0,0,0,	0,0,0,0,	0,0,0,0,	0,0,0,0

];

function setupnotetab()
{	let i = 0;
	// A5 == 67, this.a440;
	let semi = Math.pow(2, 1/12);

//	debugmsg("SEMI="+semi);

	notetab = new Array(notetabsize);
	let x = 440 / 8;
	for(i=A5-36; i < notetabsize; i++){
			notetab[i] = x;
			x = x*semi;
	}
	x = 440 / 8;
	for(i=A5-36; i > 0; i--){
		x = x/semi;
		notetab[i] = x;
	}

}

function notefreq( note ) {
	let n = Math.floor( note);
	let f;
	let m;
	let ret = 0;

	if( n < 5){
		n = 5;
	}else if( n >= notetabsize-1){
		n = notetabsize-2;
	}
	f = note - n;
	m = notetab[n];

	ret = m + (notetab[n+1] - m)*f;
	if( ret > 23500){
		ret = 23500;
	}
	return ret;
}


function UIprog()
{	let b = document.getElementById("prog");
	let bit = bitformaction.bit;
	let ctrl = bit.ctrl;

	if( b != null){
		b.style.backgroundColor = "red";
	}

	if(bit != null){
		if(ctrl != null){
			ctrl.startProg();
		}
	}

}

function UIprognext()
{	let bit = bitformaction.bit;
	let ctrl = bit.ctrl;
	if(bit != null){
		if(ctrl != null){
			ctrl.nextprog();
		}
	}

}

// just use the y value for now.
function rotaryvalue(x, y, init)
{
	let val = y+y;

	val = checkRange(Math.floor(init - val));
	return val;
}

// simple has it changed function.
function delta()
{	this.value = 0;

	this.changed = function(x)
	{
		if( isNaN( x)){
			message("delta Nan");
			x = 0;
		}
		if( this.value != x){
			this.value = x;
			return true;
		}
		return false;
	}
}

function stringValue(s)
{	let msg = "";

	if( s.indexOf("'") == -1){
		msg += "'"+s+"'";
	}else {
		msg += "'"+s+"'";
	}

	return msg;

}

function saveargs()
{	this.data = [1];
	this.count = 1;

	this.addarg = function(data)
	{
		this.data[this.count] = data;
		this.count++;
	}

	this.addnv = function(name, val)
	{
		this.addarg(stringValue(name));
		this.addarg(val);
	}

	this.getargs = function()
	{	let msg = "";
		let n;
		let cnt = 0;

		msg += (this.count)+", ";
		for(n=1; n < this.count; n++){
			msg += this.data[n]+", ";
			cnt++;
			if( cnt == 8){
				cnt = 0;
				msg += "\n  ";
			}
		}
		msg += "\n";

		return msg;
	}

	this.getdata = function()
	{
		this.data[0] = this.count;
		return this.data;
	}

	this.setdata = function(d)
	{
		this.data = d;
		this.count = d[0];
		debugmsg("SETDATA "+this.count);
	}
}

/// sound bits
// https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode
//
// HitTest() - check what was clicked on.
// Draw() - draw it.
// setValue() - called by the "program" to set the value(s)
// setData() - Generate the form area that has manual settings
// getData() - Read the form area and update the settings
// onMove() - allow adjustment by mouse movement.
//
// control are self draw objects that need more state than simple "bits".
// see softbitsctrls.js
//
// bit - defines something that can be drawn on the canvas and dragged around.
// snap - a bit can have up to 4 snaps and these handle the docking logic
//       that allows bits to be connected.

oscBit.prototype = Object.create(control.prototype);

function oscBit(bit)
{	control.call(this, bit);
	this.deg = degree;
	this.bit = bit;
	this.gain = null;
	this.osc = null;
	this.webkitstyle = false;
	this.val = 255;		// debug set initial volume
	this.freq= 60;		// middle C in Midi
	this.prevfreq = new delta();
	this.nfreq=0;
	this.audioin = null;
	this.wave = 128;	// 
	this.prevwave = new delta();
	this.prevmix = new delta();
	this.range = 12; 	// bend range
	this.a440 = 440;
	this.ival = 0;
	this.mod = 0;		// modulation routing
	this.modgain = 128;	// modulation gain
	this.modfreq = 128;	// modulation freq

    let imagename = "osc";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Osc";
	roundknobimg =this.bit.findImage("roundknob");

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let bt = b.btype & 7;	// 0 = horiz, 1 == vert

		if( bt == 0){
			x = x - 39;
			y = y - 15;
		}else {
			x = x - 39;
			y = y - 10;
		}

		if( x > 0 && x < 20 && y > 0 && y < 20 ){
			this.initx = mx;
			this.inity = my;
			this.ival = this.nfreq;
//			debugmsg("OSC HT "+this.ival);
			return this;
		}

		return null;
	}

// osc
	this.Draw = function( )
	{	var b = this.bit;
		var bt;
        let osc = this.bitimg;
		let xval = 0;

		if( b == null){
			return;
		}
		xval = this.nfreq;		// 0 - 255
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			xval = xval;
			drawImage( osc , b.x, b.y-5);
			ctx.save();
			ctx.translate( b.x+50, b.y+30);
			ctx.rotate( (xval-120 )*this.deg );
			drawImage(roundknobimg, -10, -10);
			ctx.restore();
		}else {
			drawImage( osc+1 , b.x, b.y);
			ctx.save();
			ctx.translate( b.x+50, b.y+30);
			ctx.rotate( (xval-120 )*this.deg );
			drawImage( roundknobimg, -10, -10);
			ctx.restore();
		}
	}

	this.modnames = ["freq", 'gain', 'wave'];
	this.wavenames = [ "sine", "triangle", "sawtooth", "square"];

	// osc setValue - data biased by 128 on chan 1
	this.setValue = function(data, chan)
	{
		if( chan == 0){
			if( this.val != data){
				this.val = data;
				if( data <= 16){
					// silence OSC
					this.vol = 0;
				}else {
					this.vol = 255;
					this.freq = data / 2;
					this.setoscfreq(0);
				}
				this.setoscgain();
				// debugmsg("OSC "+data);
			}
		}else if(chan == 1){
			// rel 128
			if(this.mod == 0){
				this.modfreq = checkRange(data);
				this.setoscfreq(0);
			}else if( this.mod == 1){
				this.modgain = checkRange(data);
				this.setoscgain();
			}else if( this.mod == 2){
				this.wave = data;
				if( this.prevwave.changed(data)){
					this.setoscwave(data);
				}
			}
		}
	}

	//////
	// osc
	this.setup = function()
	{
		if( notetab == null){
			setupnotetab();
		}
		if( this.osc == null){
			if( actx != null ){
				debugmsg("Create osc");
				this.osc = actx.createOscillator();
		
				this.setoscfreq(0);
				if( typeof( actx.createGainNode) != "undefined"){
					this.webkitstyle = true;
					this.gain = actx.createGainNode();
				}else {
					this.gain = actx.createGain();
				}
				this.gain.gain.setTargetAtTime( this.val/ 255, 0, 0.01);
				this.osc.connect( this.gain);
				this.setoscwave(this.wave);
		
				this.audioout = this.gain;
				if( !this.webkitstyle){
					this.osc.start(0);
				}
			}
		}

	}


	this.notefreq = function( note ) 
	{
		return notefreq(note);
	}

	this.setoscfreq = function( glide)
	{	let freq = this.freq+(this.nfreq+(this.modfreq-128) *4)/this.range;
		if( this.osc == null){
			return;
		}
		if( this.prevfreq.changed(freq) ){
//			debugmsg("OSC fr="+freq+" "+this.nfreq+" "+this.modfreq);
			this.osc.frequency.cancelScheduledValues(0);
			if( this.webkitstyle){
				this.osc.frequency.setTargetValueAtTime( notefreq(freq), 0, 0.01);
			}else {
				this.osc.frequency.setTargetAtTime( notefreq(freq ), 0, 0.01);
			}
		}
	}


	this.setoscwave = function( val)
	{	let t = null;

		if( this.osc == null){
			return;
		}
		t = this.wavenames[Math.floor(val / 64)];
//		debugmsg("wave "+val+" "+t);
		this.osc.type = t;
	}

	this.setoscgain = function( )
	{
		let vol = this.vol / 255;
		let mix = vol+(this.modgain-128)/512;
		if( this.osc == null){
			return;
		}

		if( this.prevmix.changed(mix)){
			if( this.gain != null){
				this.gain.gain.setTargetAtTime( mix, 0, 0.01);
			}
		}

	}
// osc
	this.setData = function()
	{	let msg="";
		let wave = Math.floor(this.wave / 64);
		if( bitform != null){
			bitform.innerHTML="";
		}
		let freq = this.nfreq;

		
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th align='right'>Freq</th><td > <input type='text' id='freq' name='freq' value='"+freq+"' /></td></tr>\n";
			msg += "<tr><th align='right'>Wave</th><td > <select id='wave'>";
			msg += "<option value='0' "+this.selected(wave, 0)+">Sine</option>\n";
			msg += "<option value='64' "+this.selected(wave, 1)+">Triangle</option>\n";
			msg += "<option value='128' "+this.selected(wave, 2)+">Saw</option>\n";
			msg += "<option value='255' "+this.selected(wave, 3)+">Square</option>\n";
			msg += "</select></td></tr>\n";
			msg += "<tr><th align='right'>Modulation</th><td >"+showModulation(this.mod, this.modnames)+"</td></tr>\n";

			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;

		f = document.getElementById("freq");
		if( f != null){
			val = f.value;
			this.nfreq = val;
			this.setoscfreq(0);
		}
		f = document.getElementById("wave");
		if( f != null){
			val = checkRange(f.value);
			this.wave = val;
			this.setoscwave(val);
		}
		f = document.getElementById("mod");
		if( f != null){
			val = f.value;
			this.mod = val;
		}

	}
		// osc
		this.doSave = function()
		{	let msg = "";
			// save osc state.
			let s = new saveargs();

			s.addnv("control", "'osc'");
			s.addnv("freq", this.nfreq);
			s.addnv("wave", this.wave);
			s.addnv("mod", this.mod);

			return s.getargs();
		}

		// osc
		this.doLoad = function(initdata, idx)
		{	let len = initdata[idx];
			let n = 1;
			let param="";
			let val = "";

			debugmsg("OSC doload "+idx+" "+len);
			for(n = 1; n < len ; n += 2){
				param = initdata[idx+n];
				val = initdata[idx+n+1];

				if( param == "control"){
					continue;
				}
				if( param == "freq"){
					this.nfreq = val;
				}else if( param == "wave"){
					this.wave = val;
				}else if( param == "mod"){
					this.mod = val;
				}
			}
	
		}		
	

	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;

		this.nfreq = rotaryvalue(vx, vy, this.ival);
		this.setoscfreq(0);

		if( miditargeting != null){
			midiAddTarget(this, 0);
		}

		if( bitformaction != this){
			return;
		}

		f = document.getElementById("freq");
		if( f != null){
			f.value = val;
		}
	}

}


speakerBit.prototype = Object.create(control.prototype);

// speaker is a gain node connected to the destination.

function speakerBit(bit)
{	control.call(this, bit);

    let imagename = "speaker";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.gain = null;
	this.webkitstyle = false;
	this.val = 0;
	this.audioin = null;
	this.mix = 0.2;
	this.modmix = 128;
	this.prevmix = new delta();
	this.deg = degree;
	this.ival = 0;
	this.name = "speaker";
	roundknobimg =this.bit.findImage("roundknob");

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let bt = b.btype & 7;	// 0 = horiz, 1 == vert
		
		if( bt == 0){
			x = x;
			y = y - 30;
		}else{
			x = x - 10;
			y = y - 10;
		}

		if( x > 0 && x < 20 && y > 0 && y < 20 ){
			this.initx = mx;
			this.inity = my;
			this.ival = this.mix * 255;
			return this;
		}

		return null;
	}


	// speaker
	this.setValue = function(data, chan)
	{
		let sound = true;
		let mix = 0.0;
		
		if( chan == 0){		// muting
			this.val = data;
			if( data < 16){
				sound = false;
			}
		}else if(chan == 2){ // mix
			this.mix = checkRange(data) / 255;
		}else if(chan == 1){ // modmix
			this.modmix = checkRange(data);
		}
		if( sound){
			mix = this.mix + (this.modmix-128) / 255;
			if( mix < 0){
				mix = 0;
			}
		}
		if( this.prevmix.changed(mix)){
			if(this.gain != null){
				this.gain.gain.setTargetAtTime( mix, 0, 0.1);
			}
		}
	}

	// speaker
	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval = this.mix*255;		// 0 - 255
        let speaker = this.bitimg;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage( speaker , b.x, b.y);
			ctx.save();
			ctx.translate( b.x+10, b.y+40);
			ctx.rotate( (xval-120 )*this.deg );
			drawImage( roundknobimg, -10, -10);
			ctx.restore();
		}else {
			drawImage( speaker+1 , b.x, b.y);
			ctx.save();
			ctx.translate( b.x+10, b.y+10);
			ctx.rotate( (xval-120 )*this.deg );
			drawImage( roundknobimg, -10, -10);
			ctx.restore();
		}
	}

	//////////////////////
	// speaker
	this.setup = function ()
	{
		if( this.gain == null){
			// create a new node
			if( actx != null){
				if( typeof( actx.createGainNode) != "undefined"){
			//		alert ("use gain node");
					this.webkitstyle = true;
					this.gain = actx.createGainNode();
				}else {
					this.gain = actx.createGain();
				}
				this.gain.gain.setTargetAtTime( 0, 0, 0.01);
				this.gain.connect( actx.destination); // debug
			}
			debugmsg("Setup speaker");

			this.audioin = this.gain;
		}

	}

	// speaker
	this.setData = function()
	{	let msg="";
		let val = this.mix*255;
		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th align='right'>Mix</th><td > <input type='text' id='mix' name='mix' value='"+val+"' /></td></tr>\n";

			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

	// speaker
	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;

		if(bitformaction != this){
			return;
		}

		f = document.getElementById("mix");
		if( f != null){
			this.setValue(f.value, 2);		// 0 muting, 2 mix (knob), 1 modmix
		}
	}

	// speaker
	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;
		let val = 0;
		let b = this.bit;
		let f = null;

		val = rotaryvalue(vx, vy, this.ival);
		this.mix = val / 255;
		this.setValue(val, 0);

		if( miditargeting != null){
			midiAddTarget(this, 0);
		}

		if( bitformaction != this){
			return;
		}

		f = document.getElementById("mix");
		if( f != null){
			f.value = val;
		}

	}

}


filterBit.prototype = Object.create(control.prototype);

function filterBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.filter = null;
	this.webkitstyle = false;
	this.freq=64;
	this.infreq=0;
	this.vcffreq = 60;
	this.vcfq = 0.9;
	this.vcfmodfreq = 0;
	this.knobs = [25, 30, 75, 30];
	this.values = [128, 250];
	this.selknob = 0;
	this.mod = 0;		// mod routing
	this.deg = degree;

	let i;
    let imagename = "filter";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Filter";

	roundknobimg =this.bit.findImage("roundknob");

	// filter 25,30  75,30
	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let i = 0;
		let len = this.values.length;

//		debugmsg("FIlter  "+x+" "+y);
		for(i=0; i < len; i++){
			x = mx - b.x - this.knobs[i+i]+10;
			y = my - b.y - this.knobs[i+i+1]+10;
//			debugmsg("FIlter HT "+x+" "+y);
			if( x > 0 && x < 20 && y > 0 && y < 20 ){
				this.initx = mx;
				this.inity = my;
				this.ival = this.values[i];
				debugmsg("FILT HT "+i);
				this.selknob = i+1;
				return this;
			}
		}

		return null;
	}

// filter - generic draw func
this.Draw = function( )
{   let b = this.bit;
	let xval = 0;
	let i;
	let k;

	if( b == null){
		return;
	}
	bt = b.btype & 7;	// 0 = horiz, 1 == vert

	ctx.fillStyle = "#ffffff";
	if( bt == 0){
		drawImage( this.bitimg , b.x, b.y);
		k = 0;
		for(i=0; i < this.knobs.length; i+= 2){
			xval = this.values[k];		// 0 - 255
			ctx.save();
			ctx.translate( b.x+this.knobs[i+0], b.y+this.knobs[i+1]);
			ctx.rotate( (xval-120 )*this.deg );
			drawImage(roundknobimg, -10, -10);
			ctx.restore();
			k++;
		}
	}else {
		drawImage(this.bitimg+1 , b.x, b.y);
		k = 0;
		for(i=0; i < this.knobs.length; i+= 2){
			xval = this.values[k];		// 0 - 255
			ctx.save();
			ctx.translate( b.x+this.knobs[i+0], b.y+this.knobs[i+1]);
			ctx.rotate( (xval-120 )*this.deg );
			drawImage(roundknobimg, -10, -10);
			ctx.restore();
			k++;
		}
	}

}


//////////////////////
	// filter
	this.setup = function ()
	{
		if( notetab == null){
			setupnotetab();
		}
		if( this.vcf == null){
			// create a new node
			if( actx != null){
				this.vcf = actx.createBiquadFilter();
				this.vcf.type="lowpass";
			}else {
				debugmsg("SF actx is null");
			}
		}
		if( this.vcf != null){
			this.setvcf();

			this.audioin = this.vcf;
			this.audioout = this.vcf;
			debugmsg("Setup filter");
		}
	}

	this.setvcf = function()
	{	let note;
		
		if( notetab == null){
			setupnotetab();
		}
		note = notefreq(this.vcffreq);

		if( this.vcf != null){
			this.vcf.frequency.cancelScheduledValues(0);
			this.vcf.frequency.setTargetAtTime( note, 0, 0.01); 
			this.vcf.Q.cancelScheduledValues(0);
			this.vcf.Q.setTargetAtTime( this.vcfq, 0, 0.01); 
		}

	}

	this.setValue = function(val, chan)
	{
		if( chan == 2 || ( chan == 1 && this.mod == 0)){		// cutoff
			this.values[0] = val;
			this.vcffreq = this.values[0];
			this.setvcf();
		}else if( chan == 3 || ( chan == 1 && this.mod == 1)){
			this.values[1] = val;
			this.vcfq = val / 16;
			this.setvcf();
		}
	}

	this.modnames = [ "cutoff", "resonance"];


	// filter bitform
	this.setData = function()
	{	let msg="";
		let val = this.values[0];
		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th align='right'>Cutoff</th><td > <input type='text' id='freq' value='"+val+"' /></td></tr>\n";
			msg += "<tr><th align='right'>Resonance</th><td > <input type='text' id='q' value='"+this.values[1]+"' /></td></tr>\n";
			msg += "<tr><td>"+this.vcffreq+"</td><td>"+this.vcfq+"</td></tr>\n";
			msg += "<tr><th align='right'>Modulation</th><td >"+showModulation(this.mod, this.modnames)+"</td></tr>\n";

			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

	// filter
	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;

		if( bitformaction != this){
			return;
		}
		f = document.getElementById("freq");
		if( f != null){
			val = checkRange(f.value);
			this.setValue(val, 2);
		}
		f = document.getElementById("q");
		if( f != null){
			val = checkRange(f.value);
			this.setValue(val, 3);
		}
		f = document.getElementById("mod");
		if( f != null){
			this.mod = f.value;
		}
	}

	//filter
	this.doSave = function()
	{	let msg = "";
		// save osc state.
		let s = new saveargs();

		s.addnv("control", "'filter'");
		s.addnv("freq", this.values[0]);
		s.addnv("res", this.values[1]);
		s.addnv("mod", this.mod);

		return s.getargs();
	}
		
	//filter
	this.doLoad = function(initdata, idx)
	{	var len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";

		debugmsg("FILT doload "+idx+" "+len);
		for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
			val = initdata[idx+n+1];

			if( param == "control"){
				continue;
			}
			if( param == "freq"){
				this.values[0] = val;
			}else if( param == "res"){
				this.values[1] = val;
			}else if( param == "mod"){
				this.mod = val;
			}
		}

	}		


	//filter
	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;
		let mag = vx *vx + vy * vy;
		let f = null;
		let val;

		if( this.selknob > 0){
			val = rotaryvalue(vx, vy, this.ival);
			if( this.selknob == 1){
				this.setValue(val, 2);
			}else if( this.selknob == 2){
				this.setValue(val, 3);
			}
		}
		if( miditargeting != null){
			midiAddTarget(this, this.selknob-1);
		}

		// update bitform
		if( bitformaction != this){
			return;
		}
		if(this.selknob-1 == 0){
			f = document.getElementById( "freq");
		}else if(this.selknob-1 == 1){
			f = document.getElementById("q");
		}
		if( f != null){
			f.value = this.values[this.selknob-1];
		}
	}
}


delayBit.prototype = Object.create(control.prototype);

function delayBit(bit)
{	control.call(this, bit);
	this.prevdata = new delta();
	this.knobs = [25, 30, 75, 30];
	this.values = [60, 10];
	this.selknob = 0;
	this.wet = 200;
	this.dry = 255;
	this.mod = 0;
	this.dly = 0.5;
	this.ival = 0;
	this.deg = degree;

    let imagename = "delay";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Delay";

	roundknobimg =this.bit.findImage("roundknob");

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let i = 0;
		let len = this.values.length;

//		debugmsg("FIlter  "+x+" "+y);
		for(i=0; i < len; i++){
			x = mx - b.x - this.knobs[i+i]+10;
			y = my - b.y - this.knobs[i+i+1]+10;
//			debugmsg("FIlter HT "+x+" "+y);
			if( x > 0 && x < 20 && y > 0 && y < 20 ){
				this.initx = mx;
				this.inity = my;
				this.ival = this.values[i];
				this.selknob = i+1;
				return this;
			}
		}

		return null;
	}


	this.Draw = function( )
	{   let b = this.bit;
		let xval = 0;
		let i;
		let k;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage( this.bitimg , b.x, b.y);
			k = 0;
			for(i=0; i < this.knobs.length; i+= 2){
				xval = this.values[k];		// 0 - 255
				ctx.save();
				ctx.translate( b.x+this.knobs[i+0], b.y+this.knobs[i+1]);
				ctx.rotate( (xval-120 )*this.deg );
				drawImage(roundknobimg, -10, -10);
				ctx.restore();
				k++;
			}
		}else {
			drawImage(this.bitimg+1 , b.x, b.y);
			k = 0;
			for(i=0; i < this.knobs.length; i+= 2){
				xval = this.values[k];		// 0 - 255
				ctx.save();
				ctx.translate( b.x+this.knobs[i+0], b.y+this.knobs[i+1]);
				ctx.rotate( (xval-120 )*this.deg );
				drawImage(roundknobimg, -10, -10);
				ctx.restore();
				k++;
			}
		}

	}


	//  chan 0 not used
	//  chan 1 delay time
	//  chan 2 feedback
	//
	this.setValue = function(data, chan)
	{	let wet = 0;
		let dry = 0;
		let delay = 0;

		if( chan == 0){
			return;
		}

		if( chan == 2 || (chan == 1 && this.mod == 0)){
			if(this.prevdata.changed( data)){
				delay = 0.1 + (data * 4.0) / 256;
				this.dly = data;
				this.values[0] = data;
				this.delay.delayTime.setValueAtTime(delay, 0.05);
//				debugmsg("DELAY "+this.dly+" chan="+chan+" mod="+this.mod);
			}
		}else if( chan == 3 || (chan == 1 && this.mod == 1)){
			// feedback
			wet = data / 300;
			this.wet = data;
			this.values[1] = data;
			dry = 1.0 - wet;
			this.wetNode.gain.setTargetAtTime(wet, 0, 0.05);
			this.dryNode.gain.setTargetAtTime(dry+0.2, 0, 0.05);
//			debugmsg("WET "+wet);
		}
	}


	this.setup = function()
	{
		if( this.audioin == null ){
			this.ingain = actx.createGain();		// used as the input node.
			this.ingain.gain.value = 0.75;

			this.mixer = actx.createGain();			// for output
			this.mixer.gain.value = 0.75;

			this.delay = actx.createDelay(5.0);
			this.delay.delayTime.value = 1.0;
			this.ingain.connect(this.delay);

			this.wetNode = actx.createGain();
			this.wetNode.gain.value = 0.5;
			this.delay.connect(this.wetNode);


			this.dryNode = actx.createGain();
			this.dryNode.gain.value = 0.0;
			this.ingain.connect(this.dryNode);

			this.dryNode.connect(this.mixer);

			this.wetNode.connect(this.ingain);

			this.audioout = this.mixer;
			this.audioin = this.ingain;
			debugmsg("Create delay");
		}
	}

	this.modnames = ["delay", "feedback" ];

	// delay
	this.setData = function()
	{	let msg="";
		if( bitform != null){
			bitform.innerHTML="";
		}
		let wet = this.wet * 255;
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th align='right'>Modulation</th><td >"+showModulation(this.mod, this.modnames)+"</td></tr>\n";
			msg += "<tr><th align='right'>Delay</th><td ><input type='text' id='delay' value='"+this.dly+"' /></td></tr>\n";
			msg += "<tr><th align='right'>Feedback</th><td ><input type='text' id='wet' value='"+this.wet+"' /></td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}

	
// delay
	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;

		f = document.getElementById("wet");
		if( f != null){
			val = f.value;
			this.setValue(val, 3);
		}
		f = document.getElementById("delay");
		if( f != null){
			val = f.value;
			this.setValue(val, 2);
		}
		f = document.getElementById("mod");
		if( f != null){
			val = f.value;
			this.mod = val;
		}

	}

// delay
	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;
		let mag = vx *vx + vy * vy;
		let f = null;
		let o = null;

		if( this.selknob > 0){
			this.values[this.selknob-1] = rotaryvalue(vx, vy, this.ival);
//			debugmsg("MOVE "+this.selknob+" v="+this.values[this.selknob-1]);
			if( this.selknob == 1){
				this.setValue(this.values[this.selknob-1],2);	// chan 2 delay 0 - 5sec
			}else if( this.selknob == 2){
				this.setValue(this.values[this.selknob-1],3);	// feedback
			}

		}

		if( miditargeting != null){
			o = midiAddTarget(this, this.selknob-1);
		}
		// update bitform
		if( bitformaction != this){
			return;
		}
		if(this.selknob-1 == 0){
			f = document.getElementById( "delay");
		}else if(this.selknob-1 == 1){
			f = document.getElementById("wet");
		}
		if( f != null){
			f.value = this.values[this.selknob-1];
		}
	}

	this.setup();	
	
}

function motion(tempo, gate)
{
	this.tempo = tempo;
	this.gate = gate;
	this.counter = 0;
	this.stepinc = 1;
	this.perbeat = 64;
	this.steprate = 100;

	this.step = function(){
		this.counter += this.stepinc;
		if( this.counter >= 256){
			this.counter = 0;
		}
	}

	this.settempo = function(tempo, beats)
	{
		let len = beats;
		this.tempo = tempo;
		// 64 ticks = 1.0
		// 120 = 0.5   
		this.stepinc = ( 4 / len) * (this.steprate/ 64) * tempo / 60 ;
		this.perbeat = Math.floor(256 / beats);

	}

	this.getgated = function()
	{
		let n = Math.floor(this.counter / this.perbeat);
		let val = this.counter - (n * this.perbeat);
		let g = val * 100 / this.perbeat;		// percent

		if( g >this.gate){
			return false;
		}
		return true;

	}


}


seqBit.prototype = Object.create(control.prototype);

function seqBit(bit)
{	control.call(this, bit);
	this.values = [0, 100, 200, 50];
	this.deg = degree;
	this.step = 0;
	this.selstep = 0;	// 1-4
	this.initx = 0;
	this.inity = 0;
	this.motion = new motion(120, 75);
	this.stepinc = 1;
	this.prog = 0;
	this.progprev = 0;
	this.ival = 0;
	this.clksrc = null;		// midi vs local

	let imagename = "seq";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Sequencer";
	roundknobimg =this.bit.findImage("roundknob");

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let i = 0;
		let len = this.values.length;

		x = x - 42;
		y = y - 5;

//		debugmsg("hitstart "+x+" "+y);
		for(i=0; i < len; i++){
			if( i == 4 || i == 8 || i == 12){
				y -= 50;
				x += 160;
			}
			if( x > (i * 40) && x < i*40+20 && y > 0 && y < 20 ){
				this.selstep = i+1;
				this.initx = mx;
				this.inity = my;
				this.ival = this.values[this.selstep-1];
//				debugmsg("SEQ HT "+this.ival);
				return this;
			}
		}

		return null;
	}

	// seq
	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval = b.value;		// 0 - 255
        let seq = this.bitimg;
		let i = 0;
		let ac = this.getstep();
		let len=this.values.length;
		let tx = b.x;
		let ty = b.y;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
//		debugmsg("Draw osc "+ xval+" deg "+this.deg);

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage( seq , b.x, b.y-5);
			for(i = 0; i < len; i++){
				if( i == 4 || i == 8 || i == 12){
					tx -= 160;
					ty += 50;
				}
				xval = this.values[i];
				ctx.save();
				ctx.translate( tx+50+(40 * i), ty+20);
				ctx.rotate( (xval-120 )*this.deg );
				drawImage( roundknobimg, -10, -10);
				ctx.restore();
				if( ac == i){	
					ctx.fillStyle = "#00ff00";
				}else {
					ctx.fillStyle = "#ff0000";
				}
				ctx.fillRect(tx+35+i*40,  ty+30, 5, 10);
				}
		}else {
			drawImage( this.bitimg+1 , tx, ty);
		}
	}

	// seq
	this.setValue = function(data, chan)
	{	let t = 1;
		let prevval = this.bit.value;

		if( chan == 0){
			if( data == 0){
				this.bit.value = this.values[this.getstep()];
			}else if( data == 255){
				this.motion.step();
				this.step = this.motion.counter;
				if( this.motion.getgated()){
					this.bit.value = this.values[this.getstep()];
				}else {
					this.bit.value = 0;
				}
				execmode = 2;
			}else {
				this.step = data;
				this.bit.value = this.values[this.getstep()];
			}
		}else if( chan > 1){
			this.values[chan-2] = checkRange(data+data);
			if( bitformaction == this){
				this.setData();
			}
		}
		if( this.bit.value != prevval){
			drawmode = 2;		// something changed.
		}
	}

	this.getstep = function()
	{	let len = this.values.length;

		return Math.floor(this.step / (256 / len));
	}

	// seq
	this.setData = function()
	{	let msg="";
		let i = 0;
		let len = this.values.length;

		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
			msg += "<tr><th>Knob "+(i+1)+"</th>";
			for(i=0; i < len ; i++){
				if( i == 4 || i == 12 || i == 8){
					msg += "</tr>\n";
					msg += "<tr><th>Knob "+(i+1)+"</th>";
				}
				msg += "<td > <input type='text' id='knob_"+i+"' name='knob_"+i+"' value='"+this.values[i]+"' size='4' /></td>";
			}
			msg += "</tr>\n";
			if( this.clksrc == null){
				msg += "<tr><th>Tempo</th><td colspan='2'><input type='text' id='tempo' value='"+this.motion.tempo+"'  size='4' /></td>\n";
				msg += "</tr>\n";
			}
			msg += "<tr><th>Gate</th><td colspan='2'><input type='text' id='gate' value='"+this.motion.gate+"'  size='4' /></td></tr>";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
			this.prog = 0;
		}
	
	}

	// seq
	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;
		let len = this.values.length;

		if( bitformaction != this){
			return;
		}
		for(i=0; i < len; i++){
			f = document.getElementById("knob_"+i);
			if( f != null){
				val = f.value;
				if( val < 0){
					val = 0;
				}else if( val > 255){
					val = 255;
				}
				this.values[i] = val;
			}
		}
		f = document.getElementById("tempo");
		if( f != null){
			val = f.value;
			if( val < 40){
				val = 40;
			}else if( val > 240){
				val = 240;
			}
			this.settempo(val);
		}
		f = document.getElementById("gate");
		if( f != null){
			val = f.value;
			if( val < 5){
				val = 5;
			}else if( val > 100){
				val = 100;
			}
			this.motion.gate = val;
		}

	}

	this.doSave = function()
	{	let msg = "";
		// save sequencer state.
		let n = 1+this.values.length+2;

		msg += ""+n+", ";
		for(i=0; i < this.values.length; i++){
			msg += ""+this.values[i]+", ";
		}
		msg+= ""+this.motion.tempo+", "+this.motion.gate+", ";
		return msg;
	}
		
	this.doLoad = function(initdata, idx)
	{	var len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";

		debugmsg("SEQ doload "+idx+" "+len);
		for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
			val = initdata[idx+n+1];

			if( param == "control"){
				debugmsg("CONTROL "+val);
				continue;
			}
			if( param == "freq"){
				this.values[0] = val;
			}else if( param == "res"){
				this.values[1] = val;
			}else if( param == "mod"){
				this.mod = val;
			}
		}
	}		
		

	// seq
	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;
		let mag = vx *vx + vy * vy;

		if( mag > 100 && this.selstep > 0){
			this.values[this.selstep-1] = rotaryvalue(vx, vy, this.ival);
		}
		if( miditargeting != null){
			midiAddTarget(this, this.selstep-1);
		}

	}

	this.settempo = function(tempo)
	{
		let len = this.values.length;
		debugmsg("Seq settempo "+tempo+" len "+len);
		this.motion.settempo(tempo, len);
	}

	this.settempo(100);

	// seq
	this.startProg = function()
	{
		// start programming mode
		this.prog = 0;
		this.progprev = 0;
		this.highlight();
	}

	this.nextprog = function()
	{
		this.progprev = this.prog;
		this.prog++;
		if( this.prog == this.values.length){
			this.prog = 0;
		}
		this.highlight();
	}

	this.highlight = function()
	{
		let k = document.getElementById("knob_"+(this.progprev));
		if( k != null){
			k.style.borderColor = "white";
		}
		k = document.getElementById("knob_"+(this.prog));
		if( k != null){
			k.style.borderColor = "blue";
		}
	}

	// called with key codes. 
	this.keyPress = function(code, up)
	{	let val = 0;
		let note = 0;

		let k = document.getElementById("knob_"+(this.prog));
		if( code >= 0 && code < 256){
			val = keyboardmap[code];
		}
		if( up == 0){
			if( code == 13){				// cr = next
				this.nextprog();
				this.highlight();
			}else if( code == 32){			// space = silence
				this.values[this.prog] = 0;
				k.value = 0;
				this.nextprog();
			}else if( code == 8){			// back
				this.progprev = this.prog;
				this.prog--;
				if( this.prog < 0){
					this.prog = this.values.length-1;
				}
				this.highlight();
			}else if( code == 36){			// home
				this.progprev = this.prog;
				this.prog = 0;
				this.highlight();
			}else if( val > 0 && up == 0){
				note = (val-60)*2+120;
				this.values[this.prog] = note;
				k.value = note;
				this.nextprog();
			}
		}
	}
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
//
scopeBit.prototype = Object.create(control.prototype);

function scopeBit( bit )
{	control.call(this, bit);
	this.bit = bit;
	this.analyser = null;
	this.buffer = null;
	this.bufferlength = 0;
	this.h = 100;
	this.h2 = Math.floor( this.h/2);
	this.af = null;
	this.min = 1;
	this.audioin = null;
	this.audioout = null;
	this.ctx = null;
	this.bgcolor = "#202020";
	this.color = "#ffffff";
	this.name = "Analyzer";
	this.mode = 0;		// 0 is wave, 1 is spectrum
	this.bitname = this.name;

// scope
	this.Draw = function()
	{	let idx, n;
		let x,w;
		let v, f, prev;
		let len;
		let b = this.bit;
		let scale = 350;

		this.l = b.x;
		this.t = b.y;
		this.w = 200;
		this.h = 100;
		this.r = this.l+this.w;
		this.b = this.t+this.h;

		if( this.ctx == null){
			this.ctx = ctx;
		}
		if( this.ctx == null){
			return;
		}

		this.ctx.save();

		this.ctx.fillStyle = this.bgcolor;
		this.ctx.fillRect( this.l, this.t, this.w, this.h);

		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = this.color;
		this.ctx.strokeRect( this.l, this.t, this.w, this.h);

		if( this.analyser != null){
			if( this.mode == 0){
				this.analyser.fftSize = 2048;
				this.bufferlength = this.analyser.frequencyBinCount;
				this.buffer = new Uint8Array(this.bufferlength);
				this.analyser.getByteTimeDomainData(this.buffer);
			}else {
				this.analyser.fftSize = 256;
				this.bufferlength = this.analyser.frequencyBinCount;
				this.buffer = new Uint8Array(this.bufferlength);
				this.analyser.getByteFrequencyData(this.buffer);
				scale = -350;	// invert and scale.
			}

			len = this.bufferlength/ 2;

			w = this.w * 1.0 / (len);
			x = this.l;

			f = 0;
			if( this.mode == 0){
				// find a local maximum.
				prev = this.buffer[0];
				while( prev >= this.buffer[f] && f < this.bufferlength){
					prev = this.buffer[f];
					f += 10;
				}
				while( prev <= this.buffer[f] && f < this.bufferlength){
					prev = this.buffer[f];
					f += 10;
				}
			}
	
			this.ctx.beginPath();
			n = f;
			v = ( (this.buffer[n]-128) / scale) * this.h+this.t+this.h2;
			this.ctx.moveTo(x, v);
			for(idx = 0; idx < len; idx++) {
				if( n == this.bufferlength){
					n = 0;
				}
				v = ( (this.buffer[n]-128) / scale) * this.h+this.t+this.h2;
				this.ctx.lineTo(x, v);

				x += w;
				n++;
			}

			this.ctx.stroke();
		}

		this.ctx.restore();
	}


//scope
	this.setup = function ()
	{
		if( this.analyser == null){
			if( actx != null){
				this.analyser = actx.createAnalyser();
				if( this.mode == 0){
					this.analyser.fftSize = 2048;
					this.bufferlength = this.analyser.frequencyBinCount;
					this.buffer = new Uint8Array(this.bufferlength);
					this.analyser.getByteTimeDomainData(this.buffer);
					debugmsg("Create Analyzer");
				}else {
					this.analyser.fftSize = 256;
					this.bufferlength = this.analyser.frequencyBinCount;
					this.buffer = new Uint8Array(this.bufferlength);
					this.analyser.getByteFrequencyData(this.buffer);
					debugmsg("Create Spectrum Analyzer");
				}
				this.audioin = this.analyser;
				this.audioout = this.analyser;
			}
		}
	}

	//scope
	this.setValue = function(data, chan)
	{

	}

	// initialize
	this.setup();

}


micBit.prototype = Object.create(control.prototype);

function micBit(bit)
{	control.call(this, bit);
	this.deg = degree;
	this.bit = bit;
	this.gain = null;
	this.osc = null;
	this.webkitstyle = false;
	this.val = 255;		// debug set initial volume
	this.freq= 60;		// middle C in Midi
	this.prevfreq = new delta();
	this.nfreq=0;
	this.audioin = null;
	this.audioout = null;
	this.wave = -128;		// biased by 128
	this.prevwave = new delta();
	this.prevmix = new delta();
	this.range = 12; 	// bend range
	this.a440 = 440;
	this.ival = 0;
	this.mod = 0;		// modulation routing
	this.modgain = 128;	// modulation gain
	this.modfreq = 128;	// modulation freq

    let imagename = "mic";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Mic";

	this.setup = function(){
		if( this.audioout == null){
			const constraints = { audio: true };
			navigator.mediaDevices
				.getUserMedia(constraints)
				.then((stream) => {
					source = actx.createMediaStreamSource(stream);
					this.audioout = source;
					debugmsg("Create microphone");
				})
				.catch(function (err) {
				debugmsg("The following error occured: " + err);
			});
		}
	}

	// microphone
	this.Draw = function( )
	{	var b = this.bit;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage( this.bitimg , b.x, b.y);
		}else {
			drawImage( this.bitimg+1 , b.x, b.y);
		}
	}

	this.setup();

}

pannerBit.prototype = Object.create(control.prototype);

function pannerBit(bit)
{	control.call(this, bit);
	this.deg = degree;
	this.bit = bit;
	this.panner = null;
	this.audioin = null;
	this.audioout = null;
	this.pan = 128;
	this.initx = 0;
	this.inity = 0;
	this.ival = this.pan;
	this.knobs = [50, 30];
	this.values = [128];
	this.selknob = 0;


    let imagename = "panner";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Panner";
	roundknobimg =this.bit.findImage("roundknob");

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let bt = b.btype & 7;	// 0 = horiz, 1 == vert

		if( bt == 0){
			x = x - 39;
			y = y - 15;
		}else {
			x = x - 39;
			y = y - 10;
		}

		if( x > 0 && x < 20 && y > 0 && y < 20 ){
			this.initx = mx;
			this.inity = my;
			this.ival = this.pan;
			debugmsg("pan HT "+this.ival);
			return this;
		}

		return null;
	}



	// panner
	this.Draw = function( )
	{   let b = this.bit;
		let xval = 0;
		let i;
		let k;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			drawImage( this.bitimg , b.x, b.y);
			k = 0;
			for(i=0; i < this.knobs.length; i+= 2){
				xval = this.values[k];		// 0 - 255
				ctx.save();
				ctx.translate( b.x+this.knobs[i+0], b.y+this.knobs[i+1]);
				ctx.rotate( (xval-120 )*this.deg );
				drawImage(roundknobimg, -10, -10);
				ctx.restore();
				k++;
			}
		}else {
			drawImage(this.bitimg+1 , b.x, b.y);
			k = 0;
			for(i=0; i < this.knobs.length; i+= 2){
				xval = this.values[k];		// 0 - 255
				ctx.save();
				ctx.translate( b.x+this.knobs[i+0], b.y+this.knobs[i+1]);
				ctx.rotate( (xval-120 )*this.deg );
				drawImage(roundknobimg, -10, -10);
				ctx.restore();
				k++;
			}
		}

	}


	this.setup = function(){
		if( this.audioout == null){
			this.panner = actx.createStereoPanner();
			this.panner.pan.setValueAtTime( 0.0, 0.01);

			this.audioout = this.panner;
			this.audioin = this.panner;
		}
	}

	// panner
	this.setValue = function(data, chan)
	{	let b = this.bit;
		let val = this.values[0];

		if( b == null){
			return;
		}
		if( chan == 0){
			return;
		}
		if( chan == 1){
			val += data-128;
		}
		val = checkRange(val)-128;

		this.panner.pan.setValueAtTime( val / 128, 0.01);
	}

	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;

		this.values[0] = rotaryvalue(vx, vy, this.ival);
		this.setValue( 128, 1);

		if( bitformaction != this){
			return;
		}

		f = document.getElementById("pan");
		if( f != null){
			f.value = val;
		}
	}



	this.setup();
}
