/// sound bits
var roundknobimg = 0;
var notetab = null;
const notetabsize = 192;

function setupnotetab()
{	let i = 0;

	notetab = new Array(notetabsize);
	
	for(i=0; i < notetabsize; i++){
			notetab[i] = 110 * Math.pow(2,(i-69)/12);
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
	this.freq=60;
	this.nfreq=0;
	this.infreq=0;
	this.audioin = null;
	this.wave = 0;		// 0 == saw
	this.range = 12; 	// bend range

    let imagename = "osc";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	roundknobimg =this.bit.findImage("roundknob");

	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;
		let i = 0;

		x = x - 39;
		y = y - 10;

		if( x > (i * 40) && x < i*40+20 && y > 0 && y < 20 ){
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
//		debugmsg("Draw osc "+ xval+" deg "+this.deg);

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
					this.freq = data / 2+24;
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

	// speaker
	this.setValue = function(data, chan)
	{
		if( data != this.val){
			this.val = data;
			if( this.gain != null){
				if( data < 16){
					this.gain.gain.setValueAtTime( 0, 0.01);
				}else{
					this.gain.gain.setValueAtTime( 1, 0.01);
				}
			}
		}

	}

	// speaker
	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var xval = b.value;		// 0 - 255
        let speaker = this.bitimg;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
			ctx.drawImage(bitpics[ speaker ], b.x, b.y);
		}else {
			ctx.drawImage(bitpics[ speaker+1 ], b.x, b.y);
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
				this.gain.gain.setValueAtTime( this.val/ 255, 0.01);
				this.gain.connect( actx.destination); // debug
			}

			this.audioin = this.gain;
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


seqBit.prototype = Object.create(control.prototype);

function seqBit(bit)
{	control.call(this, bit);
	this.values = [0, 100, 200, 50];
	this.deg = Math.PI/180;
	this.step = 0;
	this.selstep = 0;	// 1-4
	this.initx = 0;
	this.inity = 0;
	this.tempo = 120;
	this.stepinc = 1;

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
			return;
		}
		if( data == 255){
			// auto step use tempo
			// 60 / (tempo* 100) = time 
			// 

			this.step += this.stepinc;
			if( this.step >= 256){
				this.step = 0;
			}
		}else {
			this.step = data;
		}
		// which sequencer ?
		this.bit.value = this.values[this.getstep()]
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
			msg += "<tr><th>Tempo</th><td colspan='4'><input type='text' id='tempo' value='"+this.tempo+"'  size='4' /></td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
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

	// seq
	this.settempo = function(tempo)
	{	let len = this.values.length;
		this.tempo = tempo;
		// 64 ticks = 1.0
		// 120 = 0.5   
		this.stepinc = ( 4 / len) * (100/ 64) * tempo / 60 ;
		debugmsg("tempo "+tempo+" t="+this.stepinc);

	}

	this.settempo(100);
}




