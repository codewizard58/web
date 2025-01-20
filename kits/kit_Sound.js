///////////////////////////////////////////////////////////////////
// kit_sound.js
// Sound kit
//
// 1/20/25
var actx = null;	// audio context
var audioOK = false;

function showModulation(mod, names)
{	let msg = "";
	let n = 0;

	msg="<select id='mod'>";
	for(n=0; n < names.length; n++){
		msg += "<option value='"+n+"' "+isSelected(n, mod)+" >"+names[n]+"</option>\n";
	}

	msg += "</select>\n";

	return msg;
}

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
	// image name w h snap-l snap-r snap-t ansp-b  ? ctrl title desc domain ? ?

	this.bitnames = [
		"poweron", "power_on", 50, 50,		null, "powerout", null, null,			// 0
				0,	0, "Power On",		"Start a chain of SoftBits", 0x0010, "Power", 0, 1,	// 0
		"poweroff", "power_off", 50, 50,	"powerin", null, null, null,			// 1
				2,	0, "Power Off",		"End of a chain, optional.", 0x0001, "Power", 0, 1,	// 1
		"control", "speaker", 100, 50,	"audioin", null ,"actionin",  null,		// 0
				121,	1, "Speaker",	"Sound output",	 0x102, "Output", 0, 1,	// 0
		"control", "osc", 100, 50,	"actionin", "audioout" ,"actionin",  null,		// 0
				120,2, "Oscillator",	"Make sound",	 0x0121, "Action", 0, 1,	// 0

		"control", "filter", 100, 50,	"audioin", "audioout" ,"actionin",  null,		// 0
				122,	3, "Filter",	"Change sound",	 0x0122, "Action", 0, 1,	// 0

		"control", "delay", 100, 50,	"audioin", "audioout" ,"actionin",  null,		// 0
				126,	4, "Delay",	"change sound",	 0x0122, "Action", 0, 1,	// 0

		"control", "analyzer", 200, 100, "audioin", "audioout" ,null,  null,		// 0
				124,	10, "Analyzer",	"Display sound",	 0x0022, "Output", 0, 1,	// 0

		"control", "spectrum", 200, 100, "audioin", "audioout" ,null,  null,		// 0
				124,	11, "Spectrum",	"Display sound",	 0x0022, "Output", 0, 1,	// 0

		"control", "microphone", 50, 50, null, "audioout" ,null,  null,		// 0
				125,	12, "Microphone",	"Input sound",	 0x0020, "Input", 0, 1,	// 0
				
		"control", "camera", 200, 200, null, "audioout" ,null,  null,		// 0
				119,    14, "Camera",	"Input video",	 0x0020, "Input", 0, 1,	// 0

		"control", "panner", 100, 50, "audioin", "audioout" ,"actionin",  null,		// 0
				127,	13, "Panner",	"Pan sound",	 0x0122, "Action", 0, 1,	// 0
	
		"control", "noise", 50, 50, "actionin", "audioout" ,null,  null,		// 0
				118,	15, "Noise",	"Noise",	 	0x0021, "Input", 0, 1,	// 0

		null, null, null, null,				null, null, null, null
		];

	// name, folder:2,mode:2
	// 
	this.bitimagemap = [
		"speaker", 0xd,		// bits
		"osc", 0xd,
		"filter", 0xd,
		"delay", 0xd,
		"seq", 0xd,
		"seq8", 0xd,
		"seq16", 0xd,
		"audioout", 8,	// snaps -r -b
		"audioin", 4,	// snaps -l -t
		"roundknob", 2,	// round knob
		"mic", 0xd,
		"panner", 0xd,
		"noise", 0xd,
		null, null
	];

	this.ctrltab = [
//  ID, len, args
//	"speaker", 3, 1,	// speaker
//	"osc", 3, 2,		// oscillator
//	"filter", 3, 3,		// filter
//	"delay", 3, 4,		// delay
	"mixer", 3, 5,		// mixer
	"env", 3, 6,		// envelope
//	"analyzer", 3, 10,	// scope
//	"spectrum", 3, 11,	// spectrum
//	"microphone", 3, 12,	// microphone
//	"panner", 3, 13,	// stereo panner
	null, 0, 0, 0, 0	// end of table
	];

	// defines the op codes for the program. softbitslivs:execProgram
	this.kitctrlcodes = [
		"power_on", 0,
//		"osc", 120,
//		"speaker", 121,
//		"filter", 122,
//		"analyzer", 124,	// audio display
//		"spectrum", 124,	// audio display
//		"microphone", 125,	// audio input
//		"delay", 126,	// audio input
//		"panner", 127,	// audio panner
		null, 254
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

		// found control
		if( ctrl == 1){
			// speaker
			ct = new speakerBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 2){
			//oscillator
			ct = new oscBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 3){
			// filter
			ct = new filterBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 4){
			// delay
			ct = new delayBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 5){
			// mixer
			ct = new mixerBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 10){
			// scope
			ct = new scopeBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 11){
			// scope
			ct = new scopeBit( bit);
			ct.mode = 1;
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 12){
			ct = new micBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 13){
			ct = new pannerBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 14){
			ct = new videoBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}else if( ctrl == 15){
			ct = new noiseBit( bit);
			bit.ctrl = ct;
			ct.setData();
			return ct;
		}
		return null;
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

