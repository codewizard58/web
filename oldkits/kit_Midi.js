/////////////////////////////////////////////////////////////


// midi kit
kit_midi.prototype = Object.create(sbmodule.prototype);

function kit_midi( )
{
	sbmodule.call(this, "Midi");
	
	this.bitnames = [
		"defaulta", "osc_squelch", 100, 50,	"actionin", "actionout", null,  null,	// 21
				0,	0, "",	"",	 0x1, "Action", 0, 0,	// 7
		"default", "input_midi", 100, 50,	"blankin", "inputout" ,null,  "inputout",	// 22
				0,	0, "",	"",	 0x1, "Input", 0, 0,	// 7
		"default", "midi_gate",  100, 50,	"actionin", "actionout" ,null, "actionout",	// 23
				0,	0, "",	"",	 0x1, "Action", 0, 0,	// 7
		"control", "midi_cc",	100, 50,	"actionin", "actionout" ,"actionin",  null, // 24
				0,	1, "",	"",	 0x1, "Action", 0, 0,	// 7
		"default", "midi_cv",	100, 50,	"actionin", "actionout" ,null,  null,		// 25
				0,	1, "",	"",	 0x1, "Action", 0, 0,	// 7


		"defaulta", "env_attack", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 31
				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
		"defaulta", "env_decay", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 32
				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
		"defaulta", "env_sustain", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 33
				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
		"defaulta", "env_release", 100, 50,		"actionin", "actionout" ,"actionin",  null,		//34
				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
		"defaulta", "env_value", 100, 50,		"actionin", "actionout" , null,  null,		// 35
				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
		"default", "glide", 100, 50,		"actionin","actionout" ,"actionin", null,		// 45
				0,	0, "",	"",	 0x1,  "Action", 0, 0,	// 7
		null, null, null, null,				null, null, null, null
	];

	this.ctrltab = [
//  ID, len, args
	"midi_cv", 3, 5,		// 
	"midi_cc", 3, 6,		// 
	null, 0, 0, 0, 0	// end of table
	];


	this.bitimagemap = [
		null, null
	];



}

addkit( new kit_midi() );
new postkitload("Midi");

/////////////////////////////////////////////////////////////
