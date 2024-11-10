// MIDI
ArduinoBit_midi.prototype = Object.create(control.prototype);

function ArduinoBit_midi(abit)
{	control.call(this, abit);
	this.midi = "";
	this.bit = abit;
	this.remdata = null;
	this.maxchain = 0;
	this.sendcnt = 0;
	this.senddata = null;
	this.iscontrol = false;


	this.Init = function()
	{	var i;
		this.remdata = new Array(20);

		for(i=0 ; i < 20; i++){
			this.remdata[i] = 255;
		}
		this.maxchain = 0;
	}

/////////////////////////////////////////////////////////////
// Arduino bit specific
// MIDI
/////////////////////////////////////////////////////////////
	this.outData = function(u8data)
	{	var xmlhttp = null;

		if( this.midi == "" ){
			// no host configured..
			return;
		}

		if( canNetwork == 0){
			message("Midi not available");
			return;
		}
	}


//////////////////////////////////////////////////////////////////
/// generic control stuff
//////////////////////////////////////////////////////////////////

// MIDI
// arduino getdockedbit()
	this.getDockedBit = function(s)
	{	var b = this.bit;
		var s, p;

		s = b.snaps[s];
		if( s == null){
			return null;
		}
		p = s.paired;
		if( p == null){
			return null;
		}

		return p.bit;
	}

// MIDI
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
        ctx.drawImage(bitpics[ "arduino" ], 0, 0);

		if( b == selected){
	        ctx.fillStyle = "#c0c040";
	        ctx.fillRect( 10 ,  10, b.w - 20, b.h - 20);

	        ctx.fillStyle = "#000000";

			msg="Midi: "+this.midi;
			ctx.fillText(msg, 20, 20 );
		}
		ctx.restore();
	}

//MIDI
// arduino.hittest()
	this.HitTest = function(x, y)
	{	var res = null;
		var i;
		var b = this.bit;
		var bt;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
		this.setBounds();
		
		return res;	
	}

	this.getData = function()
	{	var msg="";
		var data;

		if( bitform != null){

			bitformaction = null;
		}
	}

//MIDI
	this.setData = function()
	{	var msg="";
		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table><tr><td align='right'>";
			msg += "MIDI:</td><td > <input type='text' name='midi' value='"+this.midi+"' /></td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
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

// MIDI
//arduino.doSave()
	this.doSave = function()
	{	var msg = "4,";

		msg += "'"+this.host+"',";
		msg += this.port+",";
		msg += "'"+this.comport+"',";
		return msg;
	}

// MIDI
// arduino.doLoad()
	this.doLoad = function( initdata, idx)
	{	var i = initdata[idx];
		if( i == 4){
			this.setHost( initdata[idx+1]);
			this.setPort( initdata[idx+2]);
			this.setComport( initdata[idx+3]);
		}
	}		
}

