// kits/kit media.js
//

const xrStuff = {};


kit_media.prototype = Object.create(sbmodule.prototype);

function kit_media()
{	
	sbmodule.call(this, "Media");
	// image name w h snap-l snap-r snap-t ansp-b  ? ctrl title desc domain ? ?

	this.bitnames = [
		"poweron", "power_on", 50, 50,		null, "powerout", null, null,			// 0
				0,	0, "Power On",		"Start a chain of SoftBits", 0x0010, "Power", 0, 1,	// 0
		"poweroff", "power_off", 50, 50,	"powerin", null, null, null,			// 1
				2,	0, "Power Off",		"End of a chain, optional.", 0x0001, "Power", 0, 1,	// 1
        "control", "headset", 100, 100,	"audioin", null ,"actionin",  null,		// 0
				121,	1, "Headset",	"Virtual Reality",	 0x102, "Action", 0, 1,	// 0
		
        null, null, null, null,				null, null, null, null
    ];

    // name, folder:2,mode:2
	// 
	this.bitimagemap = [
		null, null
	];

	this.ctrltab = [
    	null, 0, 0, 0, 0	// end of table
	];

	// defines the op codes for the program. softbitslivs:execProgram
	this.kitctrlcodes = [
		"power_on", 0,
		null, 254
	];


	this.addCtrl = function( bit)
	{	let i=0;
		let ct = null;
		let name = this.bitnames[ bit.btype+1];
		let ctrl = this.bitnames[ bit.btype+9];
		let f;

        // found control
		if( ctrl == 1){
			f = document.getElementById("xrcontrols");
			if( f != null){
			  f.style.display="block";
			}
			mediaData = bit;
			return null;
        }

        return null;
    }

    this.selected = function()
	{	let msg = "";

	}

	this.print = function()
	{	let i;
		let md;

        debugmsg("Kit_Media");

	}



    this.getdomain = function()
	{
		return 2;		// basic domain is available
	}


}

var mediaData = null;

function mediaGetBit()
{	
	debugmsg("Media getbit");
	return mediaData;
}

function mediaSetBit(ctrl)
{
	debugmsg("mediaSetBit");
	mediaData.ctrl = ctrl;
	ctrl.setData();
}


addkit( new kit_media() );

new postkitload("Media");

