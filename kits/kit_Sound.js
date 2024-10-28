///////////////////////////////////////////////////////////////////
// kit_sound.js
// Sound kit

kit_sound.prototype = Object.create(sbmodule.prototype);

function kit_sound()
{	
	sbmodule.call(this, "Sound");

	this.bitnames = [
		"control", "speaker", 100, 50,	"audioin", null ,null,  null,		// 0
				0,	1, "Speaker",	"Sound output",	 0x2, "Output", 0, 1,	// 0
		"control", "osc", 100, 50,	"actionin", "audioout" ,null,  null,		// 0
				0,	1, "Oscillator",	"Make sound",	 0x2, "Action", 0, 1,	// 0

		"control", "filter", 100, 50,	"audioin", "audioout" ,"actionin",  null,		// 0
				0,	1, "Filter",	"Change sound",	 0x2, "Action", 0, 1,	// 0

		"control", "delay", 100, 50,	"audioin", "audioout" ,"actioin",  null,		// 0
				0,	1, "Delay",	"change sound",	 0x2, "Action", 0, 1,	// 0

		null, null, null, null,				null, null, null, null
		];

	this.bitimagemap = [
		"speaker", 1,		// bits
		"osc", 1,
		"filter", 1,
		"delay", 1,
		"audioout-r", 0,	// snaps
		"audioout-b", 0,
		"audioin-t", 0,	// snaps
		"audioin-l", 0,
		null, null
	];

	this.ctrltab = [
//  ID, len, args
	"speaker", 3, 1,	// speaker
	"osc", 3, 2,		// oscillator
	"filter", 3, 3,		// filter
	"delay", 3, 4,		// delay
	null, 0, 0, 0, 0	// end of table
	];

	// defines the op codes for the program. softbitslivs:execProgram
	this.kitctrlcodes = [
		"power_on", 0,
		null, 254
	];


	this.addCtrl = function( bit)
	{	var i;
		var ct = null;
		var name = this.bitnames[ bit.btype+1];

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
					ct = new sceneBit( bit, filter_layout, "bits/filter.png");
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 4){
					// filter
					ct = new sceneBit( bit, delay_layout, "bits/delay.png");
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 5){
					// mixer
					ct = new sceneBit( bit, mixer_layout, "bits/mixer.png");
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}
			}
		}
	}

	this.loadmenu = function()
	{	var t;
		var idx;
		var m;

		t = 0;
		idx = 0;

		while( this.bitnames[idx] != null){
			m = addmenuitem( this.bitnames[idx+13] , this.bitnames[ idx+1], this.bitnames[ idx+12], this.bitnames[idx+15], this.name, idx)
			if( this.bitnames[idx+15] == 0){
				m.class = "sound";
			}

			idx += 16;
			t++;
		}
		
	}

}

//////////////////////////////////////////////////////////////////////

addkit( new kit_sound() );

new postkitload("Sound");

