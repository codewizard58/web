//////////////////////////////////////////////////////////////////
/// ARDUINO CONTROL 
//////////////////////////////////////////////////////////////////
ArduinoBit_tcp.prototype = Object.create(control.prototype);

function ArduinoBit_tcp( abit)
{	control.call(this, abit);
	this.host = "";
	this.port = "";
	this.comport = "";
	this.bit = abit;
	this.remdata = null;
	this.maxchain = 0;
	this.sendcnt = 0;
	this.senddata = null;


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
/////////////////////////////////////////////////////////////
	this.outData = function(u8data)
	{	var xmlhttp = null;

		if( this.host == "" ){
			// no host configured..
			return;
		}
		if( this.port == ""){
			this.port = 5331;
		}

		if( canNetwork == 0){
			message("Network not available");
			return;
		}


	  if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		  xmlhttp=new XMLHttpRequest();
	  }else {// code for IE6, IE5
		  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	  if( xmlhttp == null){
		return;
	  }
		xmlhttp.onreadystatechange=function(){
		  var start = 0;
		  if (xmlhttp.readyState==4){
			  if( xmlhttp.status==200){
				  var uInt8Array = new Uint8Array(xmlhttp.response);
				  if( uInt8Array[0] == 0xef &&
					 uInt8Array[1] == 0xbb &&
					  uInt8Array[2] == 0xbf){
					  start = 3;
				  }
				  arduino.processResponse(uInt8Array, start);
			  }
		  }
		  // mark req is done.
		}

		xmlhttp.onerror = function()
		{
			canNetwork = 0;
		}

		xmlhttp.open("POST","softbitslive.php",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.responseType = 'arraybuffer';

		xmlhttp.send("action=code\u0026host="+this.host+"\u0026port="+this.port+"\u0026comport="+this.comport+"\u0026data="+base64Encode( u8data) );
	}

	this.processResponse = function( uint8array, start)
	{	var len = uint8array.length;
		var i;
		var msg="";
		var cmd = 0;
		var c=0;
		var d=0;

		if( uint8array[start] == 0xf0 &&
			uint8array[start+1] == 0x53 &&
			uint8array[start+2] == 0x42 &&
			uint8array[start+3] == 0x4c 
			){
			rseqh = uint8array[start+5];
			rseql = uint8array[start+6];

			if( rseqh != seqh ||
				rseql != seql){
				seqmissmatch = 1;
				message("SEQ "+seqh+" "+seql+" "+rseqh+" "+rseql);
			}

			cmd = uint8array[start+4];

			if( cmd == 1){
				msg="Got code ";
				message(msg);
			}else if( cmd == 4){
				for(i=start+8; i < uint8array.length; i++){
					msg += hexCode(uint8array[i])+" ";
				}
				message(msg);
			}else if( cmd == 2){
				msg="MSG: ";
				for(i=start+8; i < len; i++){
					msg += "" + uint8array[i];
				}
				message(msg);
			}else if( cmd == 6){
				this.maxchain = 0;
				for(i = start+8; i < uint8array.length-1; i+= 4){
					c = uint8array[i] | (uint8array[i+1] << 7);
					d = uint8array[i+2] | ( uint8array[i+3] << 7);
					if( c >= 0 && c < 20){
					  this.remdata[c] = d;
					  if( c > this.maxchain){
						this.maxchain = c;
					  }
					}
				}
				cmd = 0;
			}else {
				message("CMD="+cmd);
			}
		}
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

// TCP
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

			msg="Host: "+this.host;
			ctx.fillText(msg, 20, 20 );
			msg="Port: "+this.port;
			ctx.fillText(msg, 20, 50 );
			msg="COM port: "+this.comport;
			ctx.fillText(msg, 20, 80 );
		}
		ctx.restore();
	}

// TCP
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

// TCP
	this.getData = function()
	{	var msg="";
		var data;

		if( bitform != null){
			data = bitform.host.value;
			this.setHost(data);
			data = bitform.port.value;
			this.setPort(data);
			data = bitform.comport.value;
			this.setComport(data);

			bitformaction = 0;
		}
	}

// TCP
	this.setData = function()
	{	var msg="";
		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table><tr><td align='right'>";
			msg += "HOST:</td><td > <input type='text' name='host' value='"+this.host+"' /></td></tr>\n";
			msg += "<tr><td align='right'>PORT:</td><td >  <input type='text' name='port' value='"+this.port+"' /></td></tr>\n";
			msg += "<tr><td>COMPORT:</td><td >  <input type='text' name='comport' value='"+this.comport+"' /></td></tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = 7;
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
// TCP
//arduino.doSave()
	this.doSave = function()
	{	var msg = "4,";

		msg += "'"+this.host+"',";
		msg += this.port+",";
		msg += "'"+this.comport+"',";
		return msg;
	}

// TCP
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
