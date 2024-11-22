/////////////////////////////////////////////////////////////////////////
// kit_basic.js
// this is the basic kit of parts
//
//

kit_basic.prototype = Object.create(sbmodule.prototype);

function kit_basic()
{	sbmodule.call(this, "Basic");


// maps bit type to image type.
//                                      l     r           t     b
//  image, title, w, h, l-snap, r-snap, t-snap, b-snap
//			 snap style, isctrl, title, description
//					domainmask, menu, a, b
// domainmask 4 groups of 4. In, out, top , bottom
// 16 per.

	this.bitnames = [
		"poweron", "power_on", 50, 50,		null, "powerout", null, null,			// 0
				0,	0, "Power On",		"Start a chain of SoftBits", 0x0010, "Power", 0, 1,	// 0
		"poweroff", "power_off", 50, 50,	"powerin", null, null, null,			// 1
				0,	0, "Power Off",		"End of a chain, optional.", 0x0001, "Power", 0, 1,	// 1
		"control", "label", 100, 50,	null, null, null, null,			// 
				0,	1, "Label",		"Displays text", 0x0000, "Power", 0, 1,	// 1
		"control", "map", 100, 100,	null, null, null, null,			// 
				0,	1, "Map",		"Map of bits in world", 0x0000, "Power", 0, 1,	// 1
	
		"split",   "wire_split", 100, 50,	"wirein",  "wireout" ,null,  "wireout",	// 2	
				0,	0, "Wire Split",	"Split one output into two",	0x3033, "Wire", 0, 1,		// 2	"split",   "wire_split"
		"patchout",   "patch_out", 50, 50,	null,  "wireout" ,null,  null,	// 2	
				0,	0, "Patch Out",	"Patch out",	0x0010, "Wire", 0, 1,		// 2	patch cable
		"patchin",   "patch_in", 50, 50,	"wirein",  null ,null,  null,	// 2	
				0,	0, "Patch In",	"Patch in",		0x0001, "Wire", 0, 1,		// 2	patch cable
		"invert", "a_invert", 50, 50,		"actionin", "actionout" , null,  null,	// 3
				0,	0, "Analog Invert",	"Turn value upside down",		 0x0011, "Action", 0, 1,		// 3
		"control", "a_dimmer", 100, 50,		"actionin", "actionout" , null,  null,	// 4
				0,	1, "Dimmer",		"",								 0x0011, "Action", 0, 1,		// 4
		"default", "a_setvalue", 100, 50,	"blankin", "actionout" , null,  null,	// 5
				0,	0, "",				"", 							0x3,  "Action", 0, 0,		// 22

		"and",	"logic_and", 100, 50,		"logicin", "logicout" , "logicin", null,	// 6
				0,	0, "And",			"", 							0x0111, "Logic", 0, 1,		// 5
		"default", "logic_or",  100, 50,	"logicin", "logicout" , "logicin",  null,	// 7
				0,	0, "Or",			"", 							0x0111, "Logic", 0, 1,		// 6
		"default", "logic_not", 100, 50,	"logicin",  "logicout" , null,  null,	// 8
				0,	0, "Not",			"", 0x0011,  "Logic", 0, 1,		// 7
		"default", "logic_nand", 100, 50,	"logicin", "logicout", "logicin",  null,	// 9
				0,	0, "Nand",			"", 0x0111,  "Logic", 0, 1,		// 8
		"default", "logic_nor", 100, 50,	"logicin", "logicout" , "logicin",  null,	// 10
				0,	0, "Nor",			"", 0x0111,  "Logic", 0, 1,		// 9

		"default", "a_plus", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 11
				0,	0, "Add ",				"", 0x0111, "Action", 0, 1,		// 22
		"default", "a_minus", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 12
				0,	0, "Subtract",		"Subtract top/bottom from left", 0x0111, "Action", 0, 1,		// 22
		"default", "a_times", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 13
				0,	0, "Multiply",				"", 0x0111, "Action", 0, 1,		// 22
		"default", "a_divide", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 14
				0,	0, "Divide",			"Divide left by top/bottom", 0x0111, "Action", 0, 1,		// 22

		"default", "a_diff", 100, 50,		"actionin", "actionout" ,"actionin",  null,		// 15
				0,	0, "",				"", 0x0111, "Action", 0, 1,		// 22
		"default", "logic_xor", 100, 50,	"logicin", "logicout" ,"logicin",  null,		// 16
				0,	0, "Xor",				"", 0x0111, "Logic", 0, 1,		// 22
		"default", "l_compare", 100, 50,    "actionin", "logicout" ,"actionin",  null,		// 17
				0,	0, "",				"", 0x0111, "Logic", 0, 1,		// 22
		"default", "l_latch", 100, 50,	    "logicin", "logicout" ,"logicin",  null,		// 18
				0,	0, "",				"", 0x0111, "Logic", 0, 1,		// 22

		"control", "bargraph", 100, 50,		"outputin", "outputout" ,null,  null,		// 19
				0,	1, "Bargraph",				"", 0x0011, "Output", 0, 1,		// 22
		"control", "bargraph2", 100, 50,	"outputin", "outputout" ,"outputin",  null,	// 20
				0,	1, "Dual Bargraph",				"", 0x111,  "Output", 0, 1,		// 22

		"control", "wire", 50, 50, 		    "wirein",  "wireout",null , null,		// 25	
				0,	1, "Wire",	"Join output to input", 0x0011, "Wire", 0, 1,		// 22
		"corner", "wire_corner", 100, 50,	"wirein", null ,null ,"wireout",	// 26
				0,	0, "Corner","Join output to input", 0x1001, "Wire", 0, 1,		// 22

		"default", "a_counter", 100, 50,	"actionin", "actionout" , null,  null,	// 27
				0,	0, "Counter",		"", 0x0011, "Action", 0, 1,		// 22
		"control", "push_switch", 100, 50,	"actionin",  "inputout" , null,  null,	// 28
				0,	1, "Push switch",	"", 0x0011, "Input", 0, 1,		// 22
		"control", "toggle_switch", 100, 50,"actionin",  "inputout" , null,  null,	// 29
				0,	1, "Toggle switch",	"", 0x0011, "Input", 0, 1,		// 22
		"control", "a_rotary",  100, 50,    "actionin", "actionout" , null,  null,	// 30
				0,	1, "",				"", 0x0011, "Action", 0, 1,		// 22
		"control", "graph", 200, 100,		"outputin", "outputout" ,"outputin",  null,		// 31
				0,	1, "Line graph",	"", 0x0111, "Output", 0, 1,		// 22

		"control", "seq", 200, 50,	"inputin", "inputout" ,null,  null,		// 0
		0,	1, "Sequencer",	"sequencer",	 0x0011, "Input", 0, 1,	// 0

		"control", "seq8", 200, 100,	"inputin", "inputout" ,null,  null,		// 0
		0,	1, "Seq8",	"8 step sequencer",	 0x0011, "Input", 0, 1,	// 0

		"control", "seq16", 200, 200,	"inputin", "inputout" ,null,  null,		// 0
		0,	1, "Seq16",	"16 step sequencer",	 0x0011, "Input", 0, 1,	// 0

		null, null, null, null,				null, null, null, null
	];


	this.ctrltab = [
//  ID, len, args
	"a_dimmer", 3, 1,		// slider 
	"bargraph", 3, 2,		// bargraph
	"bargraph2", 3, 3,		// bargraph2
	"label", 3, 4,			// label
	"map", 3, 5,			// map bit
	"a_rotary", 3, 8,		// rotary control
	"push_switch", 3, 9,		// push switch		
	"toggle_switch", 3, 10,		// toggle switch
	"graph", 3, 11,			// graph
	"wire", 3, 12,			// wire
	"seq", 3, 17,		// sequencer
	"seq8", 3, 18,		// sequencer 8 step
	"seq16", 3, 19,		// sequencer 16 step
null, 0, 0, 0, 0	// end of table
];

// defines the op codes for the program. softbitslivs:execProgram
this.kitctrlcodes = [
	"power_on", 0,
	"power_off", 2,
	"a_invert", 13,
	"a_dimmer", 14,
	"a_rotary", 114,
	"wire", 109,
	"wire_corner", 110,
	"push_switch", 112,
	"toggle_switch", 113,
	"graph", 115,
	"a_counter", 111, 
	"wire_split", 12,
	"a_plus", 36,
	"a_minus", 37,
	"a_times", 38,
	"a_divide", 39,
	"logic_and", 16,
	"logic_or", 17,
	"logic_nand", 19,
	"logic_nor", 20,
	"logic_xor", 42,
	"seq", 123,
	"seq8", 123,	// generic sequencer 8 step
	"seq16", 123,	// generic sequencer 16 step
	null, 254
];

// kit_basic addctrl
//
	this.addCtrl = function( bit)
	{	let i;
		let ct = null;
		let name = this.bitnames[ bit.btype+1];

		for(i=0; this.ctrltab[i] != null; i += this.ctrltab[i+1]){
			if( this.ctrltab[i] == name){
				// found control
//				debugmsg("Found Control: "+name+" "+bit.code+" "+this.ctrltab[i+2]);
				if( this.ctrltab[i+2] == 1){
					// slider 
					ct = new sliderBit( bit);
					bit.ctrl = ct;
					bit.code = DIMMER;		// explicit instruction code
					ct.setData();
					return ct;
				}else if(this.ctrltab[i+2] == 2){	// bargraph
					ct = new barGraphBit( bit);
					bit.ctrl = ct;
					return ct;
				}else if(this.ctrltab[i+2] == 3){	// bargraph2
					ct = new barGraph2Bit( bit);
					bit.ctrl = ct;
					return ct;
				}else if(this.ctrltab[i+2] == 4){	// label
					ct = new labelBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if(this.ctrltab[i+2] == 5){	// map
					ct = new mapBit( bit);
					bit.ctrl = ct;
					return ct;
				}else if( this.ctrltab[i+2] == 8){
					// slider
					ct = new rotaryBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 9){
					// push switch
					ct = new pushSw( bit);
					bit.ctrl = ct;
					ct.setData();
					this.value = 0;
					return ct;
				}else if( this.ctrltab[i+2] == 10){
					// toggle switch
					ct = new toggleSw( bit);
					bit.ctrl = ct;
					ct.setData();
					this.value = 0;
					return ct;
				}else if( this.ctrltab[i+2] == 11){	//  code 115
					// graph
					ct = new graphBit( bit);
					bit.ctrl = ct;
					ct.setData();
					this.value = 0;
					return ct;
				}else if( this.ctrltab[i+2] == 12){
					// wire
					ct = new wireBit( bit);
					bit.ctrl = ct;
					ct.setData();
					this.value = 0;
					return ct;
				}else if( this.ctrltab[i+2] == 17){
					// sequencer
					ct = new seqBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 18){
					// sequencer
					ct = new seqBit( bit);
					ct.values = [100,104,60,112, 64, 68, 72, 74];
					ct.bitimg =ct.bit.findImage("seq8");
					ct.bitname = "seq8";
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 19){
					// sequencer
					ct = new seqBit( bit);
					ct.values = [100,104,60,112, 64, 68, 72, 74, 100,104,60,112, 64, 68, 72, 74];
					ct.bitimg =ct.bit.findImage("seq16");
					ct.bitname = "seq16";
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else {
					message("Unknown control "+this.ctrltab[i+2]);
				}
			}
		}
		return null;
	}

// name, type 0=snap, 1=bit, 2=resources/images
	this.bitimagemap = [
		"powerin",		6,		// 4 == -l -t
		"powerout",		0xa,	// 8 == -r -b
		"flip",			2,
		"flip-v",		2,
		"remove",		0,
		"inputin",		4,		// 4 == -l -t
		"inputout",		8,		// -r -b
		"outputin",		4,
		"outputout",	8,		// -r -b
		"actionin",		4,
		"actionout",	8,		// -r -b
		"wirein",		4,
		"wireout",		8,		// -r -b
		"split",		0xd,	// -v
		"logicin-l",	0,
		"logicin-t",	0,
		"logicout-b",	0,
		"logicout-r",	0,
		"blankin-l",	0,
		"blankin-t",	0,
		"blankout-r",	0,
		"blankout-b",	0,

		"poweron",		0xd,
		"poweroff",		0xd,
		"default",		0xd,
		"defaulta",		1,
		"defaulta-v",	1,
		"corner",		1,
		"corner-v",		1,
		"straight",		1,
		"straight-v",	1,
		"control",		1,
		"control-v",	1,
		"wiresend",		1,
		"wiresend-v",	1,
		"wirerecv",		1,
		"wirerecv-v",	1,
		"short",		1,
		"short-v",		1,
		"and",			1,
		"and-v",		1,

		"knob", 		2,
		"knob-v", 		2,
		"invert", 		1,
		"invert-v",		1,
		"patchin", 		1,
		"patchin-v",	1,
		"patchout",		1,
		"patchout-v",	1,
		"imagetile",	1,
		null, null
	];

	this.getdomain = function()
	{
		return 1;		// basic domain is available
	}
}


addkit( new kit_basic() );

new postkitload("Basic");


