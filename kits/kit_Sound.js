///////////////////////////////////////////////////////////////////
// kit_sound.js
// Sound kit
var actx = null;	// audio context
var audioOK = false;

function noAudio()
{

}

function checkaudiocontext()
{

	if( typeof( AudioContext) !== "undefined" ){
		audioOK = true;
		return actx = new AudioContext();
	}
	if( typeof( webkitAudioContext) !== "undefined" ){
		audioOK = true;
		return actx = new webkitAudioContext();
	}
	alert("Web Audio not supported");
	return new noAudio();
}


kit_sound.prototype = Object.create(sbmodule.prototype);

function kit_sound()
{	
	sbmodule.call(this, "Sound");

	this.bitnames = [
		"poweron", "power_on", 50, 50,		null, "powerout", null, null,			// 0
				0,	0, "Power On",		"Start a chain of SoftBits", 0x0010, "Power", 0, 1,	// 0
		"poweroff", "power_off", 50, 50,	"powerin", null, null, null,			// 1
				0,	0, "Power Off",		"End of a chain, optional.", 0x0001, "Power", 0, 1,	// 1
		"control", "speaker", 100, 50,	"audioin", null ,"actionin",  null,		// 0
				0,	1, "Speaker",	"Sound output",	 0x102, "Output", 0, 1,	// 0
		"control", "osc", 100, 50,	"actionin", "audioout" ,"actionin",  null,		// 0
				0,	1, "Oscillator",	"Make sound",	 0x0121, "Action", 0, 1,	// 0

		"control", "filter", 100, 50,	"audioin", "audioout" ,"actionin",  null,		// 0
				0,	1, "Filter",	"Change sound",	 0x0122, "Action", 0, 1,	// 0

		"control", "delay", 100, 50,	"audioin", "audioout" ,"actionin",  null,		// 0
				0,	1, "Delay",	"change sound",	 0x0122, "Action", 0, 1,	// 0

		"control", "seq", 200, 50,	"actionin", "actionout" ,null,  null,		// 0
				0,	1, "Sequencer",	"sequencer",	 0x0011, "Action", 0, 1,	// 0

		"control", "seq8", 200, 100,	"actionin", "actionout" ,null,  null,		// 0
		0,	1, "Seq8",	"8 step sequencer",	 0x0011, "Action", 0, 1,	// 0

		"control", "seq16", 200, 200,	"actionin", "actionout" ,null,  null,		// 0
		0,	1, "Seq16",	"16 step sequencer",	 0x0011, "Action", 0, 1,	// 0

		null, null, null, null,				null, null, null, null
		];

	this.bitimagemap = [
		"speaker", 1,		// bits
		"speaker-v", 1,		// bits
		"osc", 1,
		"osc-v", 1,
		"filter", 1,
		"filter-v", 1,
		"delay", 1,
		"delay-v", 1,
		"seq", 1,
		"seq-v", 1,
		"seq8", 1,
		"seq8-v", 1,
		"seq16", 1,
		"seq16-v", 1,
		"audioout-r", 0,	// snaps
		"audioout-b", 0,
		"audioin-t", 0,	// snaps
		"audioin-l", 0,
		"roundknob", 2,	// round knob
		null, null
	];

	this.ctrltab = [
//  ID, len, args
	"speaker", 3, 1,	// speaker
	"osc", 3, 2,		// oscillator
	"filter", 3, 3,		// filter
	"delay", 3, 4,		// delay
	"mixer", 3, 5,		// mixer
	"env", 3, 6,		// envelope
	"seq", 3, 7,		// sequencer
	"seq8", 3, 8,		// sequencer 8 step
	"seq16", 3, 9,		// sequencer 16 step
	null, 0, 0, 0, 0	// end of table
	];

	// defines the op codes for the program. softbitslivs:execProgram
	this.kitctrlcodes = [
		"power_on", 0,
		"osc", 120,
		"speaker", 121,
		"filter", 122,
		"seq", 123,
		"seq8", 123,	// generic sequencer 8 step
		"seq16", 123,	// generic sequencer 16 step
		null, 254
	];


	this.addCtrl = function( bit)
	{	let i=0;
		let ct = null;
		let name = bit.name;

		for(i=0; this.ctrltab[i] != null; i += this.ctrltab[i+1]){
			if( this.ctrltab[i] == name){
				// found control
				if( this.ctrltab[i+2] == 1){
					// speaker
					ct = new speakerBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 2){
					//oscillator
					ct = new oscBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 3){
					// filter
					ct = new filterBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 4){
					// filter
					ct = new delayBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 5){
					// mixer
					ct = new mixerBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 7){
					// sequencer
					ct = new seqBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 8){
					// sequencer
					ct = new seqBit( bit);
					ct.values = [100,104,60,112, 64, 68, 72, 74];
					ct.bitimg =ct.bit.findImage("seq8");
					ct.bitname = "seq8";
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 9){
					// sequencer
					ct = new seqBit( bit);
					ct.values = [100,104,60,112, 64, 68, 72, 74, 100,104,60,112, 64, 68, 72, 74];
					ct.bitimg =ct.bit.findImage("seq16");
					ct.bitname = "seq16";
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}
			}
		}
	}

	// kit sound
	this.selected = function()
	{	let msg = "";

		if( actx == null){
			actx = checkaudiocontext();
		}
	}




	this.getdomain = function()
	{
		if( actx == null){
			actx = checkaudiocontext();
		}
		if( audioOK){
			activedomains |= 2;
			return 2;
		}
		return 0;
	}

	// addmenuitem( this.bitnames[idx+13] , this.bitnames[ idx+1], this.bitnames[ idx+12], this.bitnames[idx+15], this.name, idx)

}

//////////////////////////////////////////////////////////////////////

addkit( new kit_sound() );

new postkitload("Sound");

