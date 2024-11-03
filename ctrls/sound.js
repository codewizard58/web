/// sound bits
var roundknobimg = 0;
var notetab = null;
const notetabsize = 128;

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

	debugmsg("SEMI="+semi);

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
	debugmsg("notetab C0 "+notetab[C4-48]);
	debugmsg("notetab A1 "+notetab[A5-48]);
	debugmsg("notetab C1 "+notetab[C4-36]);
	debugmsg("notetab A2 "+notetab[A5-36]);
	debugmsg("notetab C2 "+notetab[C4-24]);
	debugmsg("notetab A3 "+notetab[A5-24]);
	debugmsg("notetab C3 "+notetab[C4-12]);
	debugmsg("notetab A4 "+notetab[A5-12]);
	debugmsg("notetab C4 "+notetab[C4]);
	debugmsg("notetab A5 "+notetab[A5]);

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
function rotaryvalue(x, y, init){
	let mag = x*x + y*y;
	let val = init;

	if( mag > 100){
		if( y > 10){
			val = y - 10;
		}else if( y < -10){
			val = y + 10;
		}
		val += 128;
		if( val > 255){
			val = 255;
		}else if(val < 0){
			val = 0;
		}
		val = 255 - val;		// prefer up screen is inc value;
	}

	return val;
}


oscBit.prototype = Object.create(control.prototype);

function oscBit(bit)
{	control.call(this, bit);
	this.deg = Math.PI/180;
	this.bit = bit;
	this.gain = null;
	this.osc = null;
	this.webkitstyle = false;
	this.val = 255;		// debug set initial volume
	this.freq=60;		// middle C in Midi
	this.nfreq=0;
	this.infreq=0;
	this.audioin = null;
	this.wave = 0;		// 0 == saw
	this.range = 12; 	// bend range
	this.a440 = 440;

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
			y = y - 10;
		}else {
			x = x - 39;
			y = y - 10;
		}

		if( x > 0 && x < 20 && y > 0 && y < 20 ){
			this.initx = mx;
			this.inity = my;
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
					if( this.gain != null){
						this.gain.gain.setValueAtTime( 0, 0.01);
					}
				}else {
					if( this.gain != null){
						this.gain.gain.setValueAtTime( 1, 0.01);
					}
					this.freq = data / 2;
					this.setoscfreq(0);
				}
				// debugmsg("OSC "+data);
			}
		}else {
			debugmsg("Osc chan "+chan+" data "+data);
		}
	}

	//////
	// osc
	this.setup = function()
	{
		if( notetab == null){
			setupnotetab();
		}
		if( actx != null){
			debugmsg("Create osc");
			this.osc = actx.createOscillator();
	
			this.setoscfreq(0);
			if( typeof( actx.createGainNode) != "undefined"){
		//		alert ("use gain node");
				this.webkitstyle = true;
				this.gain = actx.createGainNode();
			}else {
				this.gain = actx.createGain();
			}
			this.gain.gain.setValueAtTime( this.val/ 255, 0.01);
//				this.parent.audio = this.gain;
//				this.gain.connect( actx.destination); // debug
			this.osc.connect( this.gain);

			this.audioin = this.osc;
		}
	
		this.setoscwave(this.wave);
	
		if( !this.webkitstyle){
			this.osc.start(0);
		}
	
	}


	this.notefreq = function( note ) {
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
//			return 440 * Math.pow(2,(note-69)/12);
	}

	this.setoscfreq = function( glide)
	{	let freq = this.freq+(this.nfreq-128)/this.range+this.infreq ;
		if( this.osc == null){
			return;
		}
//		debugmsg("Set osc freq "+freq);
		this.osc.frequency.cancelScheduledValues(0);
		if( this.webkitstyle){
			this.osc.frequency.setTargetValueAtTime( this.notefreq(freq), 0, 0.01);
		}else {
			this.osc.frequency.setTargetAtTime( this.notefreq(freq ), 0, 0.01);
		}
	}


	this.setoscwave = function( val)
	{	this.wave = val;

		if( this.osc == null){
			return;
		}
			if( val != 0){
				this.osc.type = "square";
			}else {
				this.osc.type = "sawtooth";
			}
	}


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
			this.setoscwave(val);
			debugmsg("Osc wave "+val);
		}

	}

	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;
		let mag = vx *vx + vy * vy;
		let val = this.nfreq;

		if( mag > 100 ){
			this.nfreq = rotaryvalue(vx, vy, val);
			this.setoscfreq(0);
		}

	}

	this.dock = function(from)
	{
		debugmsg("Connect "+from.name+" to osc");
	}

	this.undock = function(from)
	{
		debugmsg("Disonnect "+from.name+" from osc");
		this.setValue(0, 0);
	}

	// from is bit
	this.dockto = function(from, dom)
	{
		debugmsg("Connect OSC to "+from.name+" dom "+dom);
		if( dom == 2){
			this.setup();
		}

		if( from.ctrl != null){
			if( from.ctrl.audioin != null){
				debugmsg("link gain to next module");
				this.gain.connect( from.ctrl.audioin);
			}
		}
	}

	this.undockfrom = function(from, dom)
	{	let b = from.ctrl;

		if( dom == 2){
			if( b != null){
				if( from.ctrl.audioin != null){
					debugmsg("unlink gain from next module");
					this.gain.disconnect( from.ctrl.audioin);
				}
			}

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
	roundknobimg =this.bit.findImage("roundknob");
	this.mix = 1.0;
	this.deg = Math.PI/180;

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let bt = b.btype & 7;	// 0 = horiz, 1 == vert
		
		if( bt == 0){
			x = x - 5;
			y = y - 35;
		}else{
			x = x - 10;
			y = y - 10;
		}

		if( x > 0 && x < 20 && y > 0 && y < 20 ){
			this.initx = mx;
			this.inity = my;
			return this;
		}
		debugmsg("SPK HT "+x+" "+y);

		return null;
	}


	// speaker
	this.setValue = function(data, chan)
	{
		if( data != this.val){
			this.val = data;
			if( this.gain != null){
				if( data < 16){
					this.gain.gain.setValueAtTime( 0, 0.01);
				}else{
					this.gain.gain.setValueAtTime( this.mix, 0.01);
				}
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
				this.gain.gain.setValueAtTime( this.mix, 0.01);
				this.gain.connect( actx.destination); // debug
			}

			this.audioin = this.gain;
		}

	}

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

	this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let t=0;

		f = document.getElementById("mix");
		if( f != null){
			val = f.value;
			if( val < 0){
				val = 0;
			}else if( val > 255){
				val = 255;
			}
			this.mix = val/255;
			this.setValue(val, 0);
		}
	}

	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;
		let mag = vx *vx + vy * vy;
		let val = this.mix*255;
		let b = this.bit;
		let f = null;

		if( mag > 100 ){
			val = rotaryvalue(vx, vy, val);
			this.mix = val / 255;
			this.setValue(val, 0);
			if( bitform != null){
				f = document.getElementById("mix");
				if( f != null){
					f.value = val;
				}
			}
		}

	}

	// speaker
	this.dock = function(from)
	{
		debugmsg("Connect "+from.name+" to speaker");
		this.setup();
		from.dockto(this.bit, 2);
	}

	// control
	// from is a bit
	// speaker
	this.undock = function(from)
	{
		debugmsg("Disconnect "+from.name+" from speaker");

		from.undockfrom(this.bit, 2);
		this.val = 0;
		if( this.gain != null){
			this.gain.gain.setValueAtTime( this.val/ 255, 0.01);
		}
	}

}


filterBit.prototype = Object.create(control.prototype);

function filterBit(bit)
{	control.call(this, bit);

    let imagename = "filter";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;

	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval = b.value;		// 0 - 255
        let filter = this.bitimg;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
//		message("Draw slider "+ xval);

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ filter ], b.x, b.y);
		}else {
			ctx.drawImage(bitpics[ filter+1 ], b.x, b.y);
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
				debugmsg("hit "+x+" "+y);
			}
			if( x > (i * 40) && x < i*40+20 && y > 0 && y < 20 ){
				this.selstep = i+1;
				this.initx = mx;
				this.inity = my;
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

	// seq
	this.onMove = function(x, y)
	{	let vx = x - this.initx;
		let vy = y - this.inity;
		let mag = vx *vx + vy * vy;

		if( mag > 100 && this.selstep > 0){
			this.values[this.selstep-1] = rotaryvalue(vx, vy, this.values[this.selstep-1]);
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




