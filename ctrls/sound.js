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
	let f = note - n;
	let m;
	let ret = 0;

	if( n < 0){
		n = 0;
	}else if( n >= notetabsize-1){
		n = notetabsize-2;
	}
	m = notetab[n];

	ret = m + (notetab[n+1] - m)*f;
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

	val = Math.floor(init - val);
	if( val > 255){
		val = 255;
	}else if(val < 0){
		val = 0;
	}
//	debugmsg("ROT "+val+" "+y+" "+init);
	return val;
}

// simple has it changed function.
function delta()
{	this.value = 0;

	this.changed = function(x)
	{
		if( this.value != x){
			this.value = x;
			return true;
		}
		return false;
	}
}

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
	this.wave = 0;		// 0 == saw
	this.prevwave = new delta();
	this.range = 12; 	// bend range
	this.a440 = 440;
	this.ival = 0;
	this.mod = 0;		// modulation routing
	this.modgain = 128;	// modulation gain
	this.modfreq = 128;	// modulation freq

    let imagename = "osc";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
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
			ctx.drawImage(bitpics[ osc ], b.x, b.y-5);
			ctx.save();
			ctx.translate( b.x+50, b.y+30);
			ctx.rotate( (xval-120 )*this.deg );
			ctx.drawImage(bitpics[roundknobimg], -10, -10);
			ctx.restore();
		}else {
			ctx.drawImage(bitpics[ osc+1 ], b.x, b.y);
			ctx.save();
			ctx.translate( b.x+50, b.y+30);
			ctx.rotate( (xval-120 )*this.deg );
			ctx.drawImage(bitpics[roundknobimg], -10, -10);
			ctx.restore();
		}
	}

	this.setValue = function(data, chan)
	{
		if( chan == 0){
			if( this.val != data){
				this.val = data;
				if( data <= 16){
					// silence OSC
					this.vol = 0;
					if( this.gain != null){
						this.gain.gain.setValueAtTime( 0, 0.01);
					}
				}else {
					this.vol = 255;
					if( this.gain != null){
						this.gain.gain.setValueAtTime( 1, 0.01);
					}
					this.freq = data / 2;
					this.setoscfreq(0);
				}
				// debugmsg("OSC "+data);
			}
		}else if(chan == 1){
			// rel 128
			if(this.mod == 0){
				this.modfreq = data;
			}else if( this.mod == 1){
				this.modgain = data;
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
				this.gain.gain.setValueAtTime( this.val/ 255, 0.01);
				this.osc.connect( this.gain);
				this.setoscwave(this.wave);
		
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
	{	let freq = this.freq+((this.nfreq+this.modfreq)-128)/this.range;
		if( this.osc == null){
			return;
		}
		if( this.prevfreq.changed(freq) ){
			this.osc.frequency.cancelScheduledValues(0);
			if( this.webkitstyle){
				this.osc.frequency.setTargetValueAtTime( notefreq(freq), 0, 0.01);
			}else {
				this.osc.frequency.setTargetAtTime( notefreq(freq ), 0, 0.01);
			}
		}
	}


	this.setoscwave = function( val)
	{	this.wave = val;

		if( this.osc == null){
			return;
		}
		if( val < 192){
			this.osc.type = "sawtooth";
		}else {
			this.osc.type = "square";
		}
	}

// osc
	this.setData = function()
	{	let msg="";
		let sqwave = "";
		let sawwave = "";
		if( bitform != null){
			bitform.innerHTML="";
		}
		let freq = this.nfreq;
		bitform = document.getElementById("bitform");
		if( bitform != null){
			if( this.wave == 1){
				sqwave = "selected";
			}else if( this.wave == 0 ){
				sawwave = "selected";
			}
			msg = "<table>";
			msg += "<tr><th align='right'>Freq</th><td > <input type='text' id='freq' name='freq' value='"+freq+"' /></td></tr>\n";
			msg += "<tr><th align='right'>Wave</th><td > <select id='wave'>";
			msg += "<option value='1' "+sqwave+">Square</option>\n";
			msg += "<option value='0' "+sawwave+">Saw</option>\n";
			msg += "</select></td></tr>\n";
			msg += "<tr><th align='right'>Modulation</th><td > <input type='text' id='mod' value='"+this.mod+"' /></td></tr>\n";

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
			val = f.value;
			this.wave = val;
			this.setoscwave(val);
			debugmsg("Osc wave "+val);
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
			let n = 1+2;
	
			msg += ""+n+", ";
			msg+= ""+this.nfreq+", "+this.wave+", ";
			return msg;
		}

		// osc
		this.doLoad = function(initdata, idx)
		{	var i = initdata[idx];
	
	
		}		
	
	
	

	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;

		this.nfreq = rotaryvalue(vx, vy, this.ival);
		this.setoscfreq(0);

	}

	//osc
	this.dock = function(from, dom)
	{	let msg="";
		
		debugmsg("Connect "+from.name+" to osc"+msg+" dom="+dom);
	}

	this.undock = function(from)
	{
		debugmsg("Disonnect "+from.name+" from osc");
		this.setValue(0, 0);
	}

	// from is bit
	// osc
	this.dockto = function(from, dom)
	{
		debugmsg("Connect OSC to "+from.name+" dom "+dom);
		if( dom == 2){
			this.setup();
		}

		if( from.ctrl != null){
			if( from.ctrl.audioin != null){
				debugmsg("link osc gain to next module");
				this.gain.connect( from.ctrl.audioin);
			}else {
				debugmsg("audioin is null");
			}
		}else {
			debugmsg("from.ctrl is null");
		}
	}

	this.undockfrom = function(from, dom)
	{	let b = from.ctrl;

		if( dom == 2){
			if( b != null){
				if( b.audioin != null){
					debugmsg("unlink osc gain from next module");
					this.gain.disconnect( from.ctrl.audioin);
				}
			}else{
				debugmsg("osc undockfrom b is null");
			}

		}else {
			debugmsg("osc undockfrom dom "+dom);
		}

	}
}


/// sound bits
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
	this.deg = Math.PI/180;
	this.ival = 0;
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
				this.gain.gain.setValueAtTime( mix, 0.01);
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
			ctx.drawImage(bitpics[ speaker ], b.x, b.y);
			ctx.save();
			ctx.translate( b.x+10, b.y+40);
			ctx.rotate( (xval-120 )*this.deg );
			ctx.drawImage(bitpics[roundknobimg], -10, -10);
			ctx.restore();
		}else {
			ctx.drawImage(bitpics[ speaker+1 ], b.x, b.y);
			ctx.save();
			ctx.translate( b.x+10, b.y+10);
			ctx.rotate( (xval-120 )*this.deg );
			ctx.drawImage(bitpics[roundknobimg], -10, -10);
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
				this.gain.gain.setValueAtTime( 0, 0.01);
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

		if( bitformaction != this){
			return;
		}

		f = document.getElementById("mix");
		if( f != null){
			f.value = val;
		}

	}

	// speaker
	this.dock = function(from, dom)
	{
		debugmsg("Connect "+from.name+" to speaker");
		if( dom == 2){
			this.setup();
			from.dockto(this.bit, 2);
		}
	}

	// control
	// from is a bit
	// speaker
	this.undock = function(from)
	{
		debugmsg("Disconnect "+from.name+" from speaker");

		from.undockfrom(this.bit, 2);
		this.setValue(0, 0);
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
	let i;

    let imagename = "filter";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
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


	this.Draw = function( )
	{	let b = this.bit;
		let bt;
		let xval = this.values[0];
		let i = 0;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ this.bitimg ], b.x, b.y);
			for(i=0; i < 4; i+= 2){
				ctx.save();
				ctx.translate( b.x+this.knobs[i], b.y+this.knobs[i+1]);
				ctx.rotate( (xval-120 )*degree );
				ctx.drawImage(bitpics[roundknobimg], -10, -10);
				ctx.restore();
				// Q
				xval = this.values[1];
			}
		}else {
			ctx.drawImage(bitpics[ this.bitimg+1 ], b.x, b.y);
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
			debugmsg("Setup filter");
		}else {
			debugmsg("Setup filter null");
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
		if( chan == 0){		// cutoff
			this.vcffreq = (val+ this.values[0])/2;
//			message("F "+val);

			this.setvcf();
		}else if( chan == 1){
			this.vcfq = (val + this.values[1]) / 16;
			this.setvcf();
		}
	}


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
			this.values[0] = val;
		}
		f = document.getElementById("q");
		if( f != null){
			val = checkRange(f.value);
			this.values[1] = val;
			this.setValue(0, 1);
		}
	}

	//filter
	this.doSave = function()
	{	let msg = "";
		// save filter state.
		let n = 1+2;

		msg += ""+n+", ";
		msg+= ""+this.values[0]+", "+this.values[1]+", ";
		return msg;
	}
		
	//filter
	this.doLoad = function(initdata, idx)
	{	var i = initdata[idx];

		if( i > 2){
			this.values[0] = initdata[idx+1];
			this.values[1] = initdata[idx+2];
			this.setValue(0, 1);
		}

	}		


	//filter
	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;
		let mag = vx *vx + vy * vy;
		let f = null;

		if( this.selknob > 0){
			this.values[this.selknob-1] = rotaryvalue(vx, vy, this.ival);
			if( this.selknob == 2){
				this.setValue(0,1);
			}
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

	//filter
	this.dock = function(from, dom)
	{	let msg="";
		
		debugmsg("Connect "+from.name+" to filter"+msg+" dom="+dom);
		if( dom == 2){
			this.setup();
			from.dockto(this.bit, 2);
		}
	}

	//filter
	this.undock = function(from)
	{
		debugmsg("Disonnect "+from.name+" from filter");
		from.undockfrom(this.bit, 2);
		this.setValue(0, 0);
	}

	// from is bit
	this.dockto = function(from, dom)
	{
		debugmsg("Connect FILTER to "+from.name+" dom "+dom);
		if( dom == 2){
			this.setup();
		}

		if( from.ctrl != null){
			if( from.ctrl.audioin != null){
				debugmsg("link vcf to next module");
				this.vcf.connect( from.ctrl.audioin);
			}
		}
	}

	//filter
	this.undockfrom = function(from, dom)
	{	let b = from.ctrl;

		if( dom == 2){
			if( b != null){
				if( from.ctrl.audioin != null){
					debugmsg("unlink vcf from next module");
					this.vcf.disconnect( from.ctrl.audioin);
				}
			}

		}

	}

}


delayBit.prototype = Object.create(control.prototype);

function delayBit(bit)
{	control.call(this, bit);

    let imagename = "delay";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval = b.value;		// 0 - 255
        let delay = this.bitimg;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
//		message("Draw slider "+ xval);

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ delay ], b.x, b.y);
		}else {
			ctx.drawImage(bitpics[ delay+1 ], b.x, b.y);
		}
	}
}

function motion(tempo, gate)
{
	this.tempo = tempo;
	this.gate = gate;
	this.counter = 0;
	this.stepinc = 1;
	this.perbeat = 64;

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
		this.stepinc = ( 4 / len) * (100/ 64) * tempo / 60 ;
		this.perbeat = Math.floor(256 / beats);

	}

	this.getgated = function()
	{
		let n = Math.floor(this.counter / this.perbeat);
		let val = this.counter - (n * this.perbeat);
		let g = val * 100 / this.perbeat;

//		debugmsg("Gate "+this.gate+" g "+g+' n '+n);
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
	this.deg = Math.PI/180;
	this.step = 0;
	this.selstep = 0;	// 1-4
	this.initx = 0;
	this.inity = 0;
	this.motion = new motion(120, 75);
	this.stepinc = 1;
	this.prog = 0;
	this.progprev = 0;
	this.ival = 0;

	let imagename = "seq";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	roundknobimg =this.bit.findImage("roundknob");

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let i = 0;
		let len = this.values.length;

		x = x - 42;
		y = y - 5;

		debugmsg("hitstart "+x+" "+y);
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
				debugmsg("SEQ HT "+this.ival);
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
			ctx.drawImage(bitpics[ seq ], b.x, b.y-5);
			for(i = 0; i < len; i++){
				if( i == 4 || i == 8 || i == 12){
					tx -= 160;
					ty += 50;
				}
				xval = this.values[i];
				ctx.save();
				ctx.translate( tx+50+(40 * i), ty+20);
				ctx.rotate( (xval-120 )*this.deg );
				ctx.drawImage(bitpics[roundknobimg], -10, -10);
				ctx.restore();
				if( ac == i){	
					ctx.fillStyle = "#00ff00";
				}else {
					ctx.fillStyle = "#ff0000";
				}
				ctx.fillRect(tx+35+i*40,  ty+30, 5, 10);
				}
		}else {
			ctx.drawImage(bitpics[ this.bitimg+1 ], tx, ty);
		}
	}

	// seq
	this.exec = function(data)
	{	let t = 1;

		if( data == 0){
			this.bit.value = this.values[this.getstep()];
			return;
		}
		if( data == 255){
			// auto step use tempo
			// 60 / (tempo* 100) = time 
			// 
			this.motion.step();
			this.step = this.motion.counter;
			if( this.motion.getgated()){
				this.bit.value = this.values[this.getstep()];
			}else {
				this.bit.value = 0;
			}
		}else {
			this.step = data;
			this.bit.value = this.values[this.getstep()];
		}
		// which sequencer ?
	}

	this.getstep = function()
	{	let len = this.values.length;

		if( len == 8){
			return Math.floor(this.step / 32);
		}else if(len == 16){
			return Math.floor(this.step / 16);
		}
		return Math.floor(this.step / 64);
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
			msg += "<tr><th>Tempo</th><td colspan='2'><input type='text' id='tempo' value='"+this.motion.tempo+"'  size='4' /></td>\n";
			msg += "</tr>\n";
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
	{	var i = initdata[idx];
	}		
		

	// seq
	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;
		let mag = vx *vx + vy * vy;

		if( mag > 100 && this.selstep > 0){
			this.values[this.selstep-1] = rotaryvalue(vx, vy, this.ival);
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
	this.ctx = ctx;
	this.bgcolor = "#404040";
	this.color = "#ff0000";

// scope
	this.Draw = function()
	{	let idx, n;
		let x,w;
		let v, f, prev;
		let len;
		let b = this.bit;

		this.l = b.x;
		this.t = b.y;
		this.w = 200;
		this.h = 100;
		this.r = this.l+this.w;
		this.b = this.t+this.h;

		if( this.analyser == null){
			return;
		}
		this.bufferlength = this.analyser.frequencyBinCount;
		this.analyser.getByteTimeDomainData(this.buffer);

		this.ctx.save();

		this.ctx.fillStyle = this.bgcolor;
		this.ctx.fillRect( this.l, this.t, this.w, this.h);

		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = this.color;
		this.ctx.strokeRect( this.l, this.t, this.w, this.h);

		len = this.bufferlength/ 2;

		w = this.w * 1.0 / (len);
		v = (this.buffer[idx] / 350.0) * this.h+this.t+5;
		x = this.l;

		f = 0;
		prev = this.buffer[0];
		while( prev >= this.buffer[f] && f < this.bufferlength){
			prev = this.buffer[f];
			f += 10;
		}
		while( prev <= this.buffer[f] && f < this.bufferlength){
			prev = this.buffer[f];
			f += 10;
		}

		this.ctx.beginPath();

 		this.ctx.moveTo(x, v);

		n = f;
		for(idx = 0; idx < len; idx++) {
			if( n == this.bufferlength){
				n = 0;
			}
			v = ( (this.buffer[n]-128) / 512.0) * this.h+this.t+this.h2;
			this.ctx.lineTo(x, v);

			x += w;
			n++;
		}

//		this.ctx.lineTo(this.r, this.h2);

		this.ctx.stroke();

		this.ctx.restore();

	}

	//scope
	this.setup = function ()
	{
		if( this.analyser == null){
			if( actx != null){
				this.analyser = actx.createAnalyser();
				this.analyser.fftSize = 2048;
				this.bufferlength = this.analyser.frequencyBinCount;
				this.buffer = new Uint8Array(this.bufferlength);
				this.analyser.getByteTimeDomainData(this.buffer);
				this.audioin = this.analyser;
				debugmsg("Create Analyzer");
			}
		}
	}

	//scope
	this.setValue = function(data, chan)
	{
		if( chan == 0){
			this.setup();
			this.timer();
		}
	}

	//scope
	this.timer = function()
	{
		this.Draw();
		return true;
	}

	// scope
	this.dock = function(from, dom)
	{	let msg="";
		
		debugmsg("Connect "+from.name+" to scope"+msg+" dom="+dom);
		if( dom == 2){
			this.setup();
			from.dockto(this.bit, 2);
		}
	}

	// scope
	this.undock = function(from)
	{
		debugmsg("Disonnect "+from.name+" from scope");

		from.undockfrom(this.bit, 2);
	}

	// from is bit
	this.dockto = function(from, dom)
	{
		debugmsg("Connect SCOPE to "+from.name+" dom "+dom);
		if( dom == 2){
			this.setup();
		}

		if( from.ctrl != null){
			if( from.ctrl.audioin != null){
				debugmsg("link scope to next module");
				this.analyser.connect( from.ctrl.audioin);
			}
		}
	}

	// scope
	this.undockfrom = function(from, dom)
	{	let b = from.ctrl;

		if( dom == 2){
			if( b != null){
				if( from.ctrl.audioin != null){
					debugmsg("unlink scope from next module");
					this.analyser.disconnect( from.ctrl.audioin);
				}else{
					debugmsg("from.ctrl.audioin  is null");
				}
			}else {
				debugmsg("from.ctrl  is null "+dom);
			}

		}else {
			debugmsg("scope undockfom dom "+dom);
		}
	}
}




