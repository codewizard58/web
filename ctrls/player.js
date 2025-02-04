// player.js
//

var player = null;      // global used below.

var sounds = [
    "pardon", "/sound/pardon" ,
    "welcome", "/sound/welcome" ,
    "welcomeguest", "/sound/welcomeguest" ,
    "RESET", "/sound/reset" ,
    null, "/sound/oops"
];


function sound(name)
{   this.name = name;
    this.buffer = null;

    this.geturl = function()
    {   var l = 0;
        var s = this.name;

        while( sounds[l] != null){
            if( sounds[l] == s){
                    return sounds[l+1];
            }
            l = l + 2;
        }
        return sounds[l+1];
    }
}

function onError()
{
        error("failed to load sound");
}

function soundplayer()
{   this.soundlist = new objlist();
    this.volume = 0;
    this.sndindex = 0;
    this.loadingindex = 0;

    if( actx == null){
        actx = checkaudiocontext();
    }

    // load a sound and play with volume v
    this.loadsound = function(s )
    {   let request = new XMLHttpRequest();
        let snd = new sound(s);
        let url = snd.geturl();

        this.soundlist.addobj(snd, null);
        request._player = this;

        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

// Decode asynchronously
        request.onload = function() {
            actx.decodeAudioData(request.response, function(buffer) {
                snd.buffer = buffer;
                request._player.loadingindex += 2;
            }, onError);
        }
        request.send();
    }
    
    this.timer = function()
    {
        if( sounds[ this.sndindex] != null && this.sndindex == this.loadingindex){
            this.sndindex += 2;
            this.loadsound( sounds[ this.sndindex-2]);
        }
    }

    this.playsound = function(s)
    { var l = this.soundlist.head;

      while( l != null){
        if( l.ob.name == s){
            this.playbuffer( l.ob.buffer);
            return;
        }
        l = l.next;
      }
      return;
    }

    this.playbuffer = function(buf, vol)
    { var src = actx.createBufferSource();
        src.buffer = buf;
        src.connect(actx.destination);

        src.onended = function(){ error("Sound ended"); };
        src.start(0);
    }
}

function playsound(sound)
{
    if( player == null){
        return;
    }

    player.playsound(sound);

}

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
function mp_filter()
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





playerBit.prototype = Object.create(control.prototype);

function playerBit(bit)
{	control.call(this, bit);
	this.bit = bit;
    this.transport = new transport();
    this.gate = 128;
    this.gridRows = 48;         // notes in grid.
    this.bar = 0;
    this.bars = 8;
    this.beat = 0;
    this.beats = 4;
    this.oddColor = "#000000";
    this.evenColor = "#808080";
    this.cursorColor = "#c0c0c0";
    this.values = new Array(this.bars * this.beats);
    this.max = 0;
    this.step = 0.0;
    this.octave = 2;
    this.playing = new Array( this.gridRows+2);
    this.grid = new Uint8Array( this.bars * this.beats * this.gridRows);
    this.dirty = new Array(this.bars * this.beats);
    let i;

    for(i=0; i < this.playing.length; i++){
        this.playing[i] = 0;
    }
    for(i=0; i < this.values.length; i++){
        this.values[i] = 0;
    }

    for(i=0; i < this.grid.length; i++){
        this.grid[i] = 0;
    }
    for(i=0; i < this.dirty.length; i++){
        this.dirty[i] = 0;
    }

    this.max = this.bars * this.beats;

    this.setNote = function(note, beat, bar)
    {   let col=0;
        let abeat = beat % this.beats;
        let abar = bar % this.bars;
        let cnt = 0;
        let i;
        let perrow = this.beats*this.bars;
        let row = 0;
        let prev = 0;
        let val = 1;

        if( note < 0){
            val = 0;
            note = -note;
        }
    
        // low notes at bottom of grid
        col = abeat + this.beats*abar;      // col
        note = note - this.octave * 12;
        if( note >= 0 && note < this.gridRows){
            note = this.gridRows - note-1;
            row = note*perrow;
            prev = this.grid[col+row];
            this.grid[col+row] = val;
        }else {
            return 0;
        }

        cnt = 0;
        for(i=0; i < this.gridRows; i++){
            if( this.grid[col + i* perrow] != 0){
                cnt++;
            }
        }
        this.dirty[col] = cnt;
        return prev;

//        debugmsg("setNote "+note+" "+col+" "+this.dirty[col]);
    }

    this.Draw = function()
    {   const bit = this.bit;
        let kw = bit.w/5;
        let kh = bit.h;
        let i,j;
        let bw, bh;
        let dx, dw;
        let bnw, bnh;
        let note=0;

        bw = Math.floor( (bit.w-kw )/ this.gridRows);
        bh = Math.floor( (bit.h )/ this.gridRows);

        ctx.strokeStyle = "#0000ff";
        ctx.strokeRect(bit.x,bit.y, bit.w, bit.h);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bit.x, bit.y, kw, kh);
        // draw black notes
        bnw = Math.floor(kw/2);
        bnh = Math.floor(kh/this.gridRows);
        dx = bit.y;
        note = this.gridRows-1;
        for(i=this.gridRows-1; i >= 0; i--){
            j = i % 12;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(bit.x, dx, kw, bnh);

            ctx.fillStyle = "#000000";
            if( j == 10 || j == 8 || j == 6 || j == 3 || j == 1){
                // Black notes.
                if( this.playing[note] != 0){
                    ctx.fillStyle = "#ff0000";
                }
                ctx.fillRect(bit.x, dx, bnw, bnh);
                ctx.fillStyle = "#000000";
                if(j == 10){
                    ctx.strokeRect(bit.x+bnw, dx+bnh/2+2, bnw, 1);
                }else if( j == 6){
                    ctx.strokeRect(bit.x+bnw, dx+bnh/2-2, bnw, 1);
                }else {
                    ctx.strokeRect(bit.x+bnw, dx+bnh/2, bnw, 1);
                }
            }else if(j == 0 || j == 5 ){
                ctx.strokeRect(bit.x, dx+bnh-1, kw, 1);
            }
            if( this.playing[note] != 0){
                ctx.fillStyle = "#ff0000";
                if( j == 0 || j == 2 || j == 4 || j == 5 || j == 7 || j == 9 || j == 11){
                    ctx.fillRect(bit.x+bnw+2, dx+1, bnw-4, bnh);
                }
            }
        dx += bnh;
            note--;
        }
        // draw grid background
        dx = kw;
        dw = bw*this.beats;
        i = 0;
        while( dx < bit.w){
            if( i == 0){
                ctx.fillStyle = this.evenColor;
                i = 1;
            }else {
                ctx.fillStyle = this.oddColor;
                i = 0;
            }
            if( bit.w - dx < dw){
                dw = bit.w - dx;        // right side may not be multiple.
            }
            ctx.fillRect(bit.x+dx, bit.y, dw, bit.h);

            dx += dw;
        }

        // draw grid
        for(i=kw; i < bit.w-bw; i += bw){
            ctx.strokeRect(bit.x+i, bit.y+0, bw, kh);
        }
        for(i = 0; i < bit.h-bh; i += bh){
            ctx.strokeRect(bit.x+kw, bit.y+i, bit.w-kw, bh);
        }
        // draw notes
        // col has dirty flag
        ctx.fillStyle = "#ffffff";
        for(i=0; i < this.beats*this.bars; i++){
            if( this.dirty[i]){
                for(j = this.gridRows-1; j >= 0; j--){
                    dx = i + j * this.beats*this.bars;
                    if( this.grid[ dx] > 0){
                        ctx.fillRect(bit.x+kw+i*bw, bit.y+j*bh, bw, bh);
                    }
                }
            }
        }


        // draw bar marker
        dx = kw+(this.bar * this.beats+this.beat) * bw;
        ctx.strokeStyle=this.cursorColor;
        ctx.strokeRect(bit.x+dx, bit.y, bw, bit.h);

        drawmode = 2;
        execmode = 2;
    }

    // player
	this.setValue = function(data, chan)
	{   let beat;
        let col=this.beat+this.bar*this.beats;
        let i;
        let perrow = this.beats*this.bars;
        const bit = this.bit;
        let n;

        if( this.max >= perrow){
            this.max = perrow;
        }

        if( chan == 0){
            this.bit.value = this.values[col]+this.values[col];
			if( data == 255){     // transport run
				this.step = this.transport.getValue();
				this.transport.trigger = 0;			// show that the transport is still being used.
				
				this.transport.resume();
				execmode = 2;
                beat = this.getstep();
                if( this.beat != beat){
                    this.beat = beat;
                    if( beat == 0){
                        this.bar++;
                        if( this.bar == this.bars){
                            this.bar = 0;
                        }
                    }
                    // new column
                    col=this.beat+this.bar*this.beats;
                    this.values[col] = 0;
                    for(i=0; i < this.gridRows; i++){
                        n = this.grid[col + i*perrow];
                        this.playing[this.gridRows - i -1] = n;
                        if( this.values[col] == 0 && n != 0){
                            this.values[col] = this.gridRows-i+ this.octave*12 -1; // midi values
                        }
                    }
//                    debugmsg("N "+col+" "+this.values[col]);

                }

//                debugmsg("Player "+this.step+" "+this.beat);
			}else {
				this.step = data;       // position within bar
				this.transport.stop();
			}
		}else if( chan > 1){
			this.values[chan-2] = checkRange(data);
			if( bitformaction == this){
				this.setData();
			}
		}

    }

    this.getstep = function()
	{	let len = this.beats;

		return Math.floor(this.step / (256 / len));
	}


    // player
    this.setData = function()
	{	let msg="";

		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
            msg += "<tr><th>Beats</th><td><input type='text' id='beats' size='3' value='"+this.beats+"'  onchange='UIrefresh(1, 0);' /></td>";
            msg += "<th>Bars</th><td><input type='text' id='bars' size='3' value='"+this.bars+"' onchange='UIrefresh(1, 0);'  ></input></td></tr>\n";
			msg += "<tr><th>Tempo</th><td colspan='2'><input type='text' id='tempo' value='"+this.transport.tempo+"'  size='4'  onchange='UIrefresh(1, 0);' /></td>\n";
			msg += "<th>Gate</th><td colspan='2'><input type='text' id='gate' value='"+this.gate+"'  size='4'  onchange='UIrefresh(1, 0);' /></td>\n";
			msg += "</tr>\n";
			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
			this.prog = 0;
		}

    }

    this.getData = function()
	{	let i = 0;
		let f = null;
		let val = 0;
		let s = new saveargs();

		s.addarg("control");
		s.addarg( "player");

        f = document.getElementById("beats");
        if( f != null){
            s.addarg("beats");
            s.addarg(f.value);
        }
        f = document.getElementById("bars");
        if( f != null){
            s.addarg("bars");
            s.addarg(f.value);
        }
        f = document.getElementById("tempo");
        if( f != null){
            s.addarg("tempo");
            s.addarg(f.value);
        }
        f = document.getElementById("gate");
        if( f != null){
            s.addarg("gate");
            s.addarg(f.value);
        }

        this.doLoad( s.getdata(), 0);
    }

    this.doLoad = function(initdata, idx)
	{	var len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";
        let tempo = this.transport.tempo;

        for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
		    val = initdata[idx+n+1];
            if( param == "'control'"){
				continue;
			}else if( param == "tempo"){
				if( val < 10){
					val = 10;
				}else if( val > 300){
					val = 300;
				}
				tempo = val;
			}else if( param == "bars"){
				this.bars = checkRange(val);
			}else if( param == "beats"){
				this.beats = checkRange(val);
			}else if( param == "gate"){
				this.gate = checkRange(val);
			}

        }
        if( this.transport.tempo != tempo){
            this.setTempo(tempo);
            debugmsg("Tempo "+tempo);
        }

    }

    this.setTempo = function(tempo)
    {
        this.transport.setTempo(tempo, this.beats);
    }

    // player
    this.startMove = function(mx, my)
    {   const bit=this.bit;
        let x = mx-bit.x;
        let y = my-bit.y;
        const kw = bit.w/5;
        const bw = Math.floor( (bit.w-kw )/ this.gridRows);
        const bh = Math.floor( (bit.h )/ this.gridRows);
        let note;
        let col;
        const perrow = this.beats*this.bars;
        let beat, bar;
        let val = 0;

        note = Math.floor(y / bh);
        note = this.gridRows - note -1;
        this.playing[note] = 2;

        if( x > kw){
            // in grid
            col = Math.floor((x-kw) / bw);
            this.beat = col % this.beats;
            this.bar = Math.floor(col / this.beats);
        }

//        note = this.gridRows - note -1;
        note = note + this.octave * 12;
//        debugmsg("MD "+note+" beat="+this.beat);

        val = this.setNote(note, this.beat, this.bar);
        if( val != 0){
            // was set so clear
            this.setNote(-note, this.beat, this.bar);
        }

    }

    // uses global mx, my
    this.stopMove = function()
    {
        const bit=this.bit;
        let x = mx-bit.x;
        let y = my-bit.y;
        const kw = bit.w/5;
        const bw = Math.floor( (bit.w-kw )/ this.gridRows);
        const bh = Math.floor( (bit.h )/ this.gridRows);
        let note;
        let col;

        note = Math.floor(y / bh);
        note = this.gridRows - note-1;
        this.playing[note] = 0;

    }


    this.setTempo(120);
    this.transport.resume();
	timer_list.addobj(this.transport, null);
	this.transport.name = "Player-transport";		// for debugging

    this.setNote(24, 0, 0);
    this.setNote(26, 1, 0);
    this.setNote(27, 2, 0);
    this.setNote(24, 0, 1);
    this.setNote(25, 5, 1);
    this.setNote(27, 6, 1);

    this.setNote(60, 0, 0);
    this.setNote(60, 0, 1);
    this.setNote(60, 0, 2);
    this.setNote(61, 1, 2);
    this.setNote(62, 2, 2);
    this.setNote(63, 3, 2);
    this.setNote(64, 0, 3);
    this.setNote(60, 2, 3);
}


function midifile_process()
{

	this.timer = function()
	{
		var but = document.getElementById( mode );

		if( but != null){
		  but.style.backgroundColor="blue";
		  but.style.color="white";
		}	

		addoutputopt();

		parsedata();

		displaydata( mode);

		return true;			// only used once
	}
}

// timer_list.addobj( new midifile_process(), null);

