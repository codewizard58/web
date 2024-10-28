///////////////////////////////////////////////////////////////
//
// Midi file decoder
//

var tracklist = null;
var runningstatus = 0;
var format = 2;		// 0 - original, 1 - newer, 2 - midi format, 3 - compact
var mode = "normal";
var g_millis=0;
var g_ppqn = 192;
var g_tempo= 500000;
var outputlist = null;
var chosenOutput = 0;

////////////////////////////////////////////////////////////////////
// notes

function notes(note, vel, chan, start)
{	this.note = note;
	this.vel = vel;
	this.chan = chan;
	this.start= start;
	this.next = null;
	this.prev = null;

}

//////////////////////////////////////////////////////////////////////
// midievent

function midievent(delta, status)
{ this.next = null;
  this.prev = null;
  this.delta = delta;
  this.status = status;
  this.data = 0;
  this.arg = 0;
  this.pos = 0;
  this.start = 0;
  this.end = 0;
  this.text = "";

  this.parse = function(start, end)
  { var x;
    var xlen;
    var xtype;

    this.pos = start;
    this.start = start;

    x = (this.status & 240) / 16;
    if( x == 8){
      runningstatus = this.status;
// debugmsg(this.start, this.pos+3 - this.start, "Off ");
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
    }else if( x == 9){
      runningstatus = this.status;
// debugmsg(this.start, this.pos+3 - this.start, "On ");
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
	  if( this.arg == 0){
	    this.status = (this.status & 15) | 128;  // 9x -> 8x
	  }
    }else if( x == 10){
// debugmsg(this.start, this.pos+3 - this.start, "After "+this.status+" "+data[this.pos+1]+" "+data[this.pos+2]);
      runningstatus = this.status;
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
    }else if( x == 11){
// debugmsg(this.start, this.pos+3 - this.start, "CC ");
      runningstatus = this.status;
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
    }else if( x == 12){
// debugmsg(this.start, this.pos+2 - this.start, "Program "+this.status+" "+data[this.pos+1]);
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+2;
    }else if( x == 13){
// debugmsg(this.start, this.pos+2 - this.start, "Chan Pressure "+this.status+" "+data[this.pos+1]);
      runningstatus = this.status;
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+2;
    }else if( x == 14){
// debugmsg(this.start, this.pos+3 - this.start, "Bend "+this.status+" "+data[this.pos+1]+" "+data[this.pos+2]);
      runningstatus = this.status;
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
    }else if( x == 15){
      if( this.status == 255){
		this.pos++;
		xtype = data[this.pos++];
		this.data = xtype;
		xlen = this.getvlen();
		this.arg = xlen;

		if( xtype == 9 || xtype == 3 || xtype == 1 || xtype == 4){
			  var amsg="";
			  var i;
			  for(i = this.pos; i < this.pos+xlen; i++){
				amsg += String.fromCharCode(data[i]);
			  }
			  this.text = amsg;
//	debugmsg(this.start, this.pos+xlen - this.start, amsg);
		}else if( xtype == 81){
			// tempo
			this.arg = (data[this.pos]*256 + data[this.pos+1])*256 + data[this.pos+2];
		}else {
//	debugmsg(this.start, this.pos+xlen - this.start, "Meta "+xtype+" "+xlen);
		}

        this.pos += xlen;
      }else if( this.status == 240){
        this.pos++;
        xlen = this.getvlen();
// debugmsg(this.start, this.pos+xlen - this.start, "SYSEX "+xlen);
        this.pos = this.pos + xlen;
      }else if( this.status == 247){	// F7 
        this.pos++;
        xlen = this.getvlen();
// debugmsg(this.start, this.pos+xlen - this.start, "SYSEX continuation/escape"+xlen);
        this.pos = this.pos + xlen;
      }
    }else {
// debugmsg(this.start, this.pos+2 - this.start, "Running status "+runningstatus+" "+this.status);
	  this.status = runningstatus;
      this.data = data[this.pos];
      this.arg = data[this.pos+1];
	  n = (runningstatus & 240) / 16;
	  if( n == 8 || n == 9 || n == 10 || n == 11 || n == 14){
	      this.pos = this.pos+2;
	  }else if(n == 12 || n == 13){
	      this.pos = this.pos+1;
	  }
    }


	this.end = this.pos;
    return this.pos;
  }

  this.getvlen = function()
  { var n = data[this.pos];
    var ret = n & 127;
    
    this.pos++;
    while( n & 128){
      ret = ret * 128;
      n = data[this.pos];
      ret = ret + (n & 127);
      this.pos++;
    }
      
    return ret;
  }

}

////////////////////////////////////////////////////////
// Filter
// used to filter track data
//
function filter()
{	this.output = 0;	// which output option.
	this.notes = 0;
	this.bend = 0;
	this.cc = 0;
	this.next = null;
	this.prev = null;
	this.num = 0;

	this.showfilter = function()
	{
		return "<tr><td>A filter</td></tr>\n";
	}


}


/////////////////////////////////////////////////////////
// track

function track()
{ this.start = 0;
  this.eventlist = null;
  this.next = null;
  this.prev = null;
  this.pos = 0;
  this.end = 0;
  this.track = 0;
  this.name = "";
  this.hasnotes = 0;
  this.code = "";
  this.notelist = null;
  this.poly = 0;
  this.vals = ["C", "CS", "D", "DS", "E", "F", "FS", "G", "GS", "A", "AS", "B"];
  this.low = 128;	// for range
  this.high = 0;
  this.clow = 128;
  this.chigh = 0;
  this.lastout = 0;
  this.showfunc = 0;	// what display function is current
  this.filterlist = null;
  this.edit = 0;
  this.tempo = 0;

  this.getvlen = function()
  { var n = data[this.pos];
    var ret = n & 127;
    
    this.pos++;
    while( n & 128){
      ret = ret * 128;
      n = data[this.pos];
      ret = ret + (n & 127);
      this.pos++;
    }
      
    return ret;
  }

  this.addnote = function( note, vel, chan, now)
  {	var n = new notes(note, vel, chan, now);
	var poly = 1;
	var nl;

	if( this.notelist == null){
	  this.notelist = n;
	  return 1;
	}
	nl = this.notelist;
	poly = 2;	// atleast 2
	while( nl.next != null){
		poly++;
		nl = nl.next;
	}
	nl.next = n;
	n.prev = nl;

	return poly;
	
  }

  this.endnote = function( note, chan, now)
  {	var nl;
    var msg = "";
    
    nl = this.notelist;
	while( nl != null){
	  if( nl.note == note && nl.chan == chan){
	    // found it. unlink
		if( this.notelist == nl){
		  this.notelist = nl.next;
		  if( nl.next != null){
		    nl.next.prev = null;
		  }
		}else {
		  nl.prev.next = nl.next;
		  if( nl.next != null){
		    nl.next.prev = nl.prev;
		  }
		}
	    return this.noteout( note, now - nl.start);
	  }

	  nl = nl.next;
	}
	return "// "+note+" not found\n";
  }

  // track.parseevents
  this.parseevents = function(i, len)
  { var delta = 0;
    var status = 0;
    var ev = null;
    var tmp;
	var el = this.eventlist;
	var n;

    this.pos = i;
    this.end = len+i;

    while( this.pos < this.end){
// debugmsg(this.pos, 8, "Parse events");
       delta = this.getvlen();
       status = data[this.pos];

       ev = new midievent(delta, status);
       if( this.eventlist == null){
         this.eventlist = ev;
       }else {
         tmp = this.eventlist;
         while( tmp.next != null){
           tmp = tmp.next;
         }
         tmp.next = ev;
         ev.prev = tmp;
       }
       this.pos = ev.parse(this.pos, this.end);

    }
// process event list
	el = this.eventlist;
	while(el != null){
	    if( el.status == 255){
			if( el.data == 3){
			  this.name =  el.text+" ";
			}else if( el.data == 81){
			    if( g_tempo == 0){
					g_tempo = el.arg;
				}
				this.tempo = el.arg;
			}
		}
		n = (el.status & 240) / 16;
		if( n == 8 ){
			this.hasnotes=1;
		}else if( n == 9){
			this.hasnotes=1;
		}
		el = el.next;
	}
  }

}



function parsetrack(i, len)
{	var t = new track();
	var tmp;
	var n=0;

	if( tracklist == null){
	  tracklist = t;
	}else {
      n = n+1;
	  tmp = tracklist;
      while(tmp.next != null){
	        n = n+1;
            tmp = tmp.next;
	  }
	  tmp.next = t;
      t.prev = tmp;
	}	
    t.track = n;
	t.start = i;
	t.parseevents(i, len);

	return t;
}

////////////////////////////////////////////////////////////////


function parsedata()
{ var i,j, n;
  var trk = null;

  i = 0;
  j = 0;
  while(i < datalen){
    chunk = String.fromCharCode(data[i])+String.fromCharCode(data[i+1])+String.fromCharCode(data[i+2])+String.fromCharCode(data[i+3]);
    j = (((data[i+4]*256)+data[i+5])*256+data[i+6])*256+data[i+7];
    i = i + 8;
    if( j + i > datalen){
      i = j + i;
    }else {
// decode chunk type
      if( chunk == "MThd"){
         miditype = data[i]*256 + data[i+1];
         midinumchunk = data[i+2]*256 + data[i+3];
		 if( (data[i+4] & 128 ) == 128){
			n = 256 - data[i+4];
			// n is frames per second
			g_millis = n * data[i+5];
		 }else {
	         g_ppqn = data[i+4]*256 + data[i+5];
		 }
      }else if( chunk == "MTrk"){
	     trk = parsetrack(i, j);
      }
      i = i + j;
    }
  }
}


//////////////////////////////////////////////////////////////////////

var reqInProgress = 0;
var canNetwork = 1;

//////////////////////////////////////////////////////////////////////////////////
// save a copy as midi file to preview
//
function UIsave()
{ var t;
  var len = 0;
  var i, j, cnt = 0;
  var f = document.getElementById("saveform");

  t = tracklist;
  while(t != null ){
	if( t.hasnotes == 2){
	  cnt++;
	  len += t.end-t.start+8;
	}
	t = t.next;
  }

  if( cnt == 0){
    alert("No tracks selected");
	xdebugmsg = "No tracks selected";
	return;
  }

  len += 14;		// for header.

  outdata = new Uint8Array( len);
  for(i = 0; i < 14; i++){
    outdata[i] = data[i];
  }

  t = tracklist;
  while(t != null){
	if( t.hasnotes == 2){
	  f.name.value = t.name;	// use the last name.
	  // copy this data
	  for(j = t.start - 8; j < t.end; j++){
		outdata[i] = data[j];
		i++;
	  }
	}

	t = t.next;
  }

  outdata[11] = cnt;   // number of tracks

  f.data.value = base64Encode( outdata);
  f.action.value = "save";
  f.submit();
}

//////////////////////////////////////////////////////////////////////
// play the miditracks
//

function trackPlayer( data)
{	this.next = null;
	this.prev = null;
	this.data = data;
	this.period = 0;
	this.curevent = null;
	if( data.eventlist != null){
		this.period=data.eventlist.delta;
		this.curevent = data.eventlist;
	}
}

object_list.addobj( new objfactory("fileplayer", playerobj) );

playerobj.prototype = Object.create(sceneObject.prototype);

function playerobj( ctx, parent, x, y, w, h )
{	sceneObject.call(this, ctx, x, y, w, h);
	this.tracklist = null;
	this.period = 0;
	this.curnote = null;
	this.now = 0;
	this.target = null;
	this.playing = false;
	this.scene = parent;
	this.tickdelta = 0;
	this.nowcount = 0;
	this.tempo = 500000;
	this.ppqn = 192;

	this.stopPlaying = function()
	{
		this.allNotesOff();
		this.tracklist = null;
		this.playing = false;
	}

	this.play = function()
	{	var t;

		this.tracklist = null;
		// create note list
		this.period = 0;

		  t = tracklist;
		  while(t != null ){
			if( t.hasnotes == 2){
			  this.addTrack(t);
			}
			t = t.next;
		  }

		if( g_ppqn != 0){
			this.ppqn = g_ppqn;
			this.tempo = g_tempo;
			this.tickDelta = Math.floor(this.tempo/this.ppqn);
		}

		this.playing = true;
		showStopButton();
		timer_list.addobj(this, null);
	}

	this.addTrack = function(trk)
	{	var t = new trackPlayer(trk);

		t.next = this.tracklist;
		this.tracklist = t;

		if( t.next != null){
			t.next.prev = t;
		}
	}

	this.timer = function()
	{	var tl;
		var flag = false;	// any active tracks?

		if( this.playing == false){
			return false;	// done
		}

		if(  this.tickDelta > 0){
			this.nowcount += 1000*timerval;	// add elapsed time.
			xdebugmsg = "now="+this.nowcount+" timerval="+timerval+" delta="+this.tickDelta;
			while(this.nowcount > this.tickDelta){
				tl = this.tracklist;
				while( tl != null){
					if( tl.period > 0){
						tl.period--;
					}
					while( tl.period <= 0 && tl.curevent != null){
						// output event
						this.outData( tl.curevent);
						tl.curevent = tl.curevent.next;
						tl.period = tl.curevent.delta;
					}
					if( tl.curevent != null){
						flag = true;
					}

					tl = tl.next;
				}
				this.nowcount -= this.tickDelta;
			}
		}
		if( flag == false){
			UIstopit();
			return false;
		}
		return false;
	}

	// output midi event data
	this.outData = function( mevent)
	{	var msg3 = [0,0,0];
		var msg2 = [0,0];
		var x = mevent.status & 0xf0;

		// look for clocks etc


		// bad data check
		if( (mevent.arg & 0x80) == 0x80 ||  (mevent.data & 0x80) == 0x80){
			xdebugmsg = "outData "+mevent.status+" "+mevent.data+" "+mevent.arg;
			mevent.arg = mevent.arg & 0x7f;
			mevent.data = mevent.data & 0x7f;
		}

		if( x == 0x80){
			msg3[0] = mevent.status;
			msg3[1] = mevent.data;
			msg3[2] = mevent.arg;

			this.dosetvalues("key-off", mevent.status&0xf, msg3);
		}else if( x == 0x90){
			msg3[0] = mevent.status;
			msg3[1] = mevent.data;
			msg3[2] = mevent.arg;

			if( mevent.arg == 0){
				msg3[0] = 0x80 | (mevent.status&0xf);
				this.dosetvalues("key-off", mevent.status&0xf, msg3);
			}else {
				this.dosetvalues("key-on", mevent.status&0xf, msg3);
			}

		}else if( x == 0xb0){ // CC
			msg3[0] = mevent.status;
			msg3[1] = mevent.data;
			msg3[2] = mevent.arg;

			this.dosetvalues("CC", mevent.status&0xf, msg3);

		}else if( x == 0xe0){ // Pitch Bend
			msg3[0] = mevent.status;
			msg3[1] = mevent.data;
			msg3[2] = mevent.arg;

			this.dosetvalues("bend", mevent.status&0xf, msg3);

		}else if( x == 0xc0){
			msg2[0] = mevent.status;
			msg2[1] = mevent.data;
			useMIDIout.midi.value.send( msg2);
		}
	}

	this.allNotesOff = function()
	{	var msg = [0xb0, 123, 0];
		var i;

		for(i=0; i < 16; i++){
			msg[0] = 0xb0+i;
			this.dosetvalues("all-notes-off", i, msg);
			useMIDIout.midi.value.send( msg);
		}
	}

	this.loadlocal = function()
	{
	}

	this.setvalue = function(arg, val)
	{
		if( arg == "play"){
			if( val == 1){
				this.play();
			}else if( val == 0){
				this.stopPlaying();
				this.allNotesOff();
			}
		}
	}
}

