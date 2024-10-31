/////////////////////////////////////////////////////////////////////////
// kit_arduino.js
// arduino kit
kit_arduino.prototype = Object.create(sbmodule.prototype);

function kit_arduino( )
{
	sbmodule.call(this, "Arduino");
	
	this.bitnames = [
		"defaulta", "input_a0", 100, 50,	"blankin", "inputout" ,null,  null,		// 0
				0,	0, "Input A0",	"Read from Analog input A0",	 0x1, "Input", 0, 0,	// 0
		"defaulta", "input_a1", 100, 50,	"blankin", "inputout" ,null,  null,		// 1
				0,	0, "Input A1",	"Read from Analog input A1",	 0x1,  "Input", 0, 0,	// 1
		"defaulta", "input_d0", 100, 50,	"blankin", "inputout" ,null,  null,		// 2
				0,	0, "Input D0",	"Read from Digital input D0",	 0x1,  "Input", 0, 0,	// 2
		"control", "input_ax",  100, 50,	"blankin", "inputout"  , null,  null,	// 3	
				0,	1, "Input A(x)",	"Read from specified analog pin",	 0x1,  "Input", 0, 0,	// 3
		"default", "input_dx", 100, 50,		"actionin", "actionout" ,null,  null,	// 4
				0,	1, "Input D(x)",	"Read from specified digital pin",	 0x1,  "Input", 0, 0,	// 4
	
		"defaulta", "output_a5", 100, 50,	"outputin", "outputout" ,null,  null,	// 5
				0,	0, "Output A5",	"",	 0x1, "Output", 0, 0,	// 5
		"defaulta", "output_a9", 100, 50,	"outputin", "outputout" ,null,  null,	// 6
				0,	0, "Output A9",	"",	 0x1,  "Output", 0, 0,	// 6
		"defaulta", "output_a11", 100, 50,	"outputin", "outputout" ,null,  null,	// 7
				0,	0, "",	"",	 0x1,  "Output", 0, 0,	// 7
		"defaulta", "output_d1", 100, 50,	"outputin", "outputout" ,null,  null,	// 8
				0,	0, "",	"",	 0x1,  "Output", 0, 0,	// 7
		"defaulta", "output_d5", 100, 50,	"outputin", "outputout" ,null,  null,	// 9
				0,	0, "",	"",	 0x1,  "Output", 0, 0,	// 7

		"defaulta", "output_d9", 100, 50,	"outputin", "outputout" ,null,  null,	// 10
				0,	0, "",	"",	 0x1,  "Output", 0, 0,	// 7
		"defaulta", "output_d11", 100, 50,	"outputin", "outputout" ,null,  null,	// 11
				0,	0, "",	"",	 0x1,  "Output", 0, 0,	// 7
		"defaulta", "output_d12", 100, 50,	"outputin", "outputout" ,null,  null,	// 12
				0,	0, "",	"",	 0x1,  "Output", 0, 0,	// 7
		"defaulta", "output_d13", 100, 50,	"outputin", "outputout" ,null,  null,	// 13
				0,	0, "",	"",	 0x1,  "Output", 0, 0,	// 7
		"control", "output_ax", 100, 50,	"outputin", "outputout" ,null,  null,	// 14	
				0,	1, "",	"",	 0x1,  "Output", 0, 0,	// 7

		"control", "output_dX", 100, 50,	"outputin", "outputout" ,null,  null,	// 15
				0,	1, "",	"",	 0x1,  "Output", 0, 0,	// 7
		"control", "output_note", 100, 50,	"outputin", "outputout" ,null,  null,	// 16
				0,	1, "",	"",	 0x1,  "Output", 0, 0,	// 7
		"control", "output_cc", 100, 50,	"outputin", "outputout" ,null,  null,	// 17
				0,	1, "",	"",	 0x1,  "Output", 0, 0,	// 7

		"control", "arduino", 100, 50,	"wirein", "wireout" ,null,  null,	// 18
				0,	1, "",	"",	 0x1,  "Wire", 7, 1,	// 7
	
		null, null, null, null,				null, null, null, null
	];


// override sbmodule.finddomain
//
 this.finddomain = function( bit)
 {	var idx = bit.btype;

	if( idx < 336){
		return this.bitnames[ idx+12];
	}
	return 1;
 }

	this.bitimagemap = [
		"default",		1,
		"default-v",	1,
		"defaulta",		1,
		"defaulta-v",	1,

		"blankin-l",	0,
		"blankin-t",	0,
		"blankout-r",	0,
		"blankout-b",	0,
		"inputin-l",	0,
		"inputout-r",	0,
		"outputin-l",	0,
		"outputin-t",	0,
		"outputout-r",	0,
		"outputout-b",	0,

		null, null
	];

	this.ctrltab = [
//  ID, len, args
	"output_dx", 3, 13,		// output_dx
	"input_dx", 3, 13,		// input_dx
	"input_ax", 3, 13,		// input_ax
	"output_ax", 3, 13,		// output_ax
	"output_note", 3, 5,		// output note
	"output_cc", 3, 6,		// output CC
	"arduino", 3, 7,	// arduino bit
	null, 0, 0, 0, 0	// end of table
];

// kit_arduino
	this.addCtrl = function( bit)
	{	var i;
		var ct = null;
		var name = this.bitnames[ bit.btype+1];

		for(i=0; this.ctrltab[i] != null; i += this.ctrltab[i+1]){
			if( this.ctrltab[i] == name){
				// found control
	//			message("Found Control: "+this.name+" "+bit.code+" "+this.ctrltab[i+2]);
				if( this.ctrltab[i+2] == 1){
					// slider
					ct = new sliderBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if(this.ctrltab[i+2] == 5){	// output Note
					ct = new outputNoteBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if(this.ctrltab[i+2] == 6){	// output CC
					ct = new outputCCBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if(this.ctrltab[i+2] == 7){	// Arduino bit
					ct = new ArduinoBit( bit);
					bit.ctrl = ct;

					ct.Init();
					ct.setData();

					return ct;
				}else if( this.ctrltab[i+2] == 8){
					// slider
					ct = new rotaryBit( bit);
					bit.ctrl = ct;
					ct.setData();
					return ct;
				}else if( this.ctrltab[i+2] == 13){
					// output_ax, input_ax, output_dx, input_dx
					ct = new valueBit( bit);
					bit.ctrl = ct;
					ct.setData();
					this.value = 0;
					return ct;
				}else {
					message("Unknown control "+this.ctrltab[i+2]);
				}
			}
		}
		return null;
	}

}

addkit( new kit_arduino() );


//////////////////////////////////////////////////////////////////
/// ARDUINO CONTROL 
//////////////////////////////////////////////////////////////////

ArduinoBit.prototype = Object.create( control.prototype);

function ArduinoBit( abit)
{	this.host = "";
	this.port = "";
	this.comport = "";
	this.name="";
	this.remdata = null;
	this.maxchain = 0;
	this.sendcnt = 0;
	this.senddata = null;

	control.call(this, abit);

	this.Init = function()
	{	var i;

		this.remdata = new Array(20);

		for(i=0 ; i < 20; i++){
			this.remdata[i] = 255;
		}
		this.maxchain = 0;

	}

	this.setName = function( name)
	{
		this.name = name;
	}


	this.setHost = function( host)
	{
		this.host = host;
	}


	this.setPort = function( port)
	{
		this.port = port;
	}


	this.setComport = function( port)
	{
		this.comport = port;
	}

//////////////////////////////////////////////////////////////////
/// generic control stuff
//////////////////////////////////////////////////////////////////

// arduino.draw()
	this.Draw = function( )
	{	var b = this.bit;
		var bt;
		var i;
		var msg="";

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		ctx.save();
		ctx.translate( b.x, b.y);
		if( bt != 0){
			ctx.translate( 0, b.h);
			ctx.rotate(- Math.PI/2);
		}
        ctx.drawImage(bitpics[ "defaulta" ], 0, 0);

		if( b == selected){
	        ctx.fillStyle = "#c0c040";
	        ctx.fillRect( 10 ,  10, b.w - 20, b.h - 20);

	        ctx.fillStyle = "#000000";

			msg=this.name;
			ctx.fillText(msg, 20, 20 );
		}

		ctx.restore();

		return;

		// not used...
		if( b == selected){
	        ctx.fillStyle = "#c0c040";
	        ctx.fillRect( 10 ,  10, b.w - 20, b.h - 20);

	        ctx.fillStyle = "#000000";

			msg="Host: "+this.host;
			ctx.fillText(msg, 20, 20 );
			msg="Port: "+this.port;
			ctx.fillText(msg, 20, 50 );
			msg="COM port: "+this.comport;
			ctx.fillText(msg, 20, 80 );
		}
	}

// arduino.hittest()
	this.HitTest = function(x, y)
	{	var res = null;
		var i;
		var b = this.bit;
		var bt;
		var d;	// for domlist search ..

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
		this.setBounds();
		
		return res;	
	}

	this.matchdomain = function( host, port)
	{	var d;

		d = domainlist;
		while(d != null){
			if( d.name == "Arduino"){
				if( d.host == host && d.port == port){
					return d;
				}
			}
			d = d.next;
		}
		return null;
	}

	this.getData = function()
	{	var msg="";
		var data;
		var d, dom;

		if( bitform != null){
			data = bitform.name.value;
			this.setName(data);
			data = bitform.host.value;
			this.setHost(data);
			data = bitform.port.value;
			this.setPort(data);
			data = bitform.comport.value;
			this.setComport(data);

			if( arduino == null){
				if( this.host != "" &&
					this.port != ""){
					arduino = this;
				}
			}
			if( arduino != null){
				enableMenuItems("arduino");
			}

			// find/create a domain for this configured bit.
			dom = this.matchdomain(this.host, this.port);

			if( dom == null){
			// look for a blank Arduino object.
				dom = this.matchdomain( "", "");
				if( dom != null){
					dom.host = this.host;
					dom.port = this.port;
					dom.title = this.name;
					this.bit.domain = dom;
					message("Use blank domain");
				}
			}
			if( dom == null){
				dom = new arduino_domain();
				adddomain( dom);
				dom.host = this.host;
				dom.port = this.port;
				dom.title = this.name;
				this.bit.domain = dom;
				message("New domain");
			}

		}
	}

	this.setData = function()
	{	var msg="";
		var bit = this.bit;

		bitFormClear();

		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table><tr><td align='right'>";
			msg += "Name:</td><td > <input type='text' name='name' value='"+this.name+"' /></td></tr>\n<tr><td align='right'>";
			msg += "HOST:</td><td > <input type='text' name='host' value='"+this.host+"' /></td></tr>\n";
			msg += "<tr><td align='right'>PORT:</td><td >  <input type='text' name='port' value='"+this.port+"' /></td></tr>\n";
			msg += "<tr><td>COMPORT:</td><td >  <input type='text' name='comport' value='"+this.comport+"' /></td></tr>\n";

			msg += "<tr><td>Kit="+bit.kit.name+"</td>\n";
			msg += "<tr><td>Bcode="+bit.bcode+"</td><td>Btype="+bit.btype+"</td>\n";
			msg += "</tr><tr><td>dommask="+bit.domainmask+"</td><td>domain=";
			if( bit.domain != null){
				msg += "domain("+bit.domain.name+", "+bit.domain.title+")";
			}else {
				msg += "null";
			}
			msg += "</td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			sketch.bitformctrl = this;
		}
	}


	this.onMove = function()
	{
	}


	this.startMove = function()
	{
	}


	this.stopMove = function()
	{
	}

//arduino.doSave()
	this.doSave = function()
	{	var msg = "6,'Arduino',";

		msg += "'"+this.host+"',";
		msg += this.port+",";
		msg += "'"+this.comport+"',";
		msg += "'"+this.name+"',";
		return msg;
	}

// arduino.doLoad()
	this.doLoad = function( initdata, idx)
	{	var i = initdata[idx];
		if( i >= 5){
			this.setHost( initdata[idx+2]);
			this.setPort( initdata[idx+3]);
			this.setComport( initdata[idx+4]);
			if( i >= 6){
				this.setName( initdata[idx+5]);
			}
		}
	}		

	// arduino control
	this.delbit = function()
	{
		if( arduino == this){
			disableMenuItems( "arduino");
			arduino = null;
		}
	}
}

