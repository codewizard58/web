// player.js
//

var player = null;      // global used below.
var tracklist = null;
var g_millis = 0;       // set by parsetrack
var g_ppqn = 96;        // modified by parsetrack

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

function debugmsgx(idx, len, msg){
    debugmsg("Off-"+idx+" len="+len+" ;"+msg+"'");
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

  this.parse = function(data, datalen, start, end)
  { var x;
    var xlen;
    var xtype;

    this.pos = start;
    this.start = start;

    x = (this.status & 240) / 16;
    if( x == 8){
      runningstatus = this.status;
 // debugmsgx(this.start, this.pos+3 - this.start, "Off ");
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
    }else if( x == 9){
      runningstatus = this.status;
 // debugmsgx(this.start, this.pos+3 - this.start, "On ");
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
	  if( this.arg == 0){
	    this.status = (this.status & 15) | 128;  // 9x -> 8x
	  }
    }else if( x == 10){
 // debugmsgx(this.start, this.pos+3 - this.start, "After "+this.status+" "+data[this.pos+1]+" "+data[this.pos+2]);
      runningstatus = this.status;
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
    }else if( x == 11){
 // debugmsgx(this.start, this.pos+3 - this.start, "CC ");
      runningstatus = this.status;
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
    }else if( x == 12){
// debugmsgx(this.start, this.pos+2 - this.start, "Program "+this.status+" "+data[this.pos+1]);
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+2;
    }else if( x == 13){
// debugmsgx(this.start, this.pos+2 - this.start, "Chan Pressure "+this.status+" "+data[this.pos+1]);
      runningstatus = this.status;
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+2;
    }else if( x == 14){
// debugmsgx(this.start, this.pos+3 - this.start, "Bend "+this.status+" "+data[this.pos+1]+" "+data[this.pos+2]);
      runningstatus = this.status;
	  this.data = data[this.pos+1];
	  this.arg = data[this.pos+2];
      this.pos = this.pos+3;
    }else if( x == 15){
      if( this.status == 255){
		this.pos++;
		xtype = data[this.pos++];
		this.data = xtype;
		xlen = this.getvlen(data);
		this.arg = xlen;

		if( xtype == 9 || xtype == 3 || xtype == 1 || xtype == 4){
			  var amsg="";
			  var i;
			  for(i = this.pos; i < this.pos+xlen; i++){
				amsg += String.fromCharCode(data[i]);
			  }
			  this.text = amsg;
//	debugmsgx(this.start, this.pos+xlen - this.start, amsg);
		}else if( xtype == 81){
			// tempo
			this.arg = (data[this.pos]*256 + data[this.pos+1])*256 + data[this.pos+2];
		}else {
//	debugmsgx(this.start, this.pos+xlen - this.start, "Meta "+xtype+" "+xlen);
		}

        this.pos += xlen;
      }else if( this.status == 240){
        this.pos++;
        xlen = this.getvlen(data);
// debugmsgx(this.start, this.pos+xlen - this.start, "SYSEX "+xlen);
        this.pos = this.pos + xlen;
      }else if( this.status == 247){	// F7 
        this.pos++;
        xlen = this.getvlen(data);
// debugmsgx(this.start, this.pos+xlen - this.start, "SYSEX continuation/escape"+xlen);
        this.pos = this.pos + xlen;
      }
    }else {
// debugmsgx(this.start, this.pos+2 - this.start, "Running status "+runningstatus+" "+this.status);
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

  this.getvlen = function(data)
  { let n = data[this.pos];
    let ret = n & 127;
    
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
  this.tempo = 0;
  this.hasnotes = 0;
  this.firstnote = 0;
  this.midiout = "";
  this.midioutdev = 0;
  this.player = null;

  this.getvlen = function(data)
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

   
    // track.parseevents
    this.parseevents = function(data, datalen, i, len)
    { let delta = 0;
        let status = 0;
        let ev = null;
        let tmp;
        let el = this.eventlist;
        let n;
        let now = 0;

        this.pos = i;
        this.end = len+i;

        while( this.pos < this.end){
        // debugmsg(this.pos, 8, "Parse events");
            delta = this.getvlen(data);
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
            this.pos = ev.parse(data, datalen, this.pos, this.end);

        }
        // process event list
        el = this.eventlist;
        while(el != null){
            if( el.status == 255){
                if( el.data == 3){
                    this.name =  el.text+" ";
                }else if( el.data == 81){
                    // microseconds per beat.
                    this.tempo = Math.floor(60*( 1000 / (el.arg / 1000) ));
                }
            }
            n = (el.status & 240) / 16;
            if( n == 8 ){               // note off
                now += el.delta;
                this.hasnotes=1;
                if( this.firstnote == 0){
                    this.firstnote = Math.floor(now / this.ppq);
                }
            }else if( n == 9){          // note on
                now += el.delta;
                this.hasnotes=1;
                if( this.firstnote == 0){
                    this.firstnote = Math.floor(now / this.ppq);
                }
            }
            el = el.next;
        }

    }
}


function parsetrack(data, datalen, i, len)
{	const t = new track();
	let tmp;
	let n=0;

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
	t.parseevents(data, datalen, i, len);

	return t;
}


function parsedata(data, datalen)
{ let i,j, n;
  let trk = null;
  let miditype;
  let midinumchunk;

  debugmsg("Midi Parse "+datalen);
  i = 0;
  j = 0;
  while(i < datalen){
//    chunk = data.substring(i, i+4);
    chunk = String.fromCharCode(data[i])+String.fromCharCode(data[i+1])+String.fromCharCode(data[i+2])+String.fromCharCode(data[i+3]);
//    debugmsg("chunk("+i+") "+chunk);
    j = (((data[i+4]*256)+data[i+5])*256+data[i+6])*256+data[i+7];
    i = i + 8;
    if( j + i > datalen){
	  debugmsg( "Bad length="+j+" for "+chunk);
      i = j + i;
    }else {
// decode chunk type
// debugmsg(i-8, 14, "Chunk="+chunk+" len="+j); 
      if( chunk == "MThd"){
         miditype = data[i]*256 + data[i+1];
         midinumchunk = data[i+2]*256 + data[i+3];
		 if( (data[i+4] & 128 ) == 128){
			n = 256 - data[i+4];
			// n is frames per second
			g_millis = n * data[i+5];
		 }else {
	         g_ppqn = data[i+4]*256 + data[i+5];
             debugmsg("PPQN "+g_ppqn);
		 }
      }else if( chunk == "MTrk"){
	     trk = parsetrack(data, datalen, i, j);
      }
      i = i + j;
    }
  }
}


function loadMidiFile(file) {
	let reader = new FileReader();
	reader.readAsArrayBuffer(file);
	reader.onloadend = function(e) {
	  let data = new Uint8Array(e.target.result);

      parsedata(data, data.length);

      if( tracklist != null){
        // process tracklist
        processTrackList(tracklist, file.name);
        tracklist = null;
      }
	}
}
  
function processTrackList(tr, name)
{   let b= sketch.blist;
    let bit;

    debugmsg("Process track list");

    createBit("midi_player", "Midi");
    while(b != null){
        bit = b.bit;
        if( bit.name == "midiplayer"){
            break;
        }

        bit = null;
        b = b.next;
    }
    if( bit != null){
        bit.ctrl.loadTrackList(tr, name);
    }


}


function UIplayTrack(track)
{   const ctrl = bitformaction;
    let t;
    if( ctrl == null){
        return;
    }
    t = ctrl.tracklist;
    while(t != null){
        if( t.track == track){
            break;
        }
        t = t.next;
    }
    if( t == null){
        return;
    }
    ctrl.setup();
    ctrl.active = track+1;
    ctrl.loadTrack(t, ctrl.start);
    ctrl.getData();
    ctrl.setData();

}

function UIstartPos(delta)
{   let f = document.getElementById("startposition");
    const ctrl = bitformaction;
    if( ctrl == null){
        return;
    }
    ctrl.start += delta;
    if( ctrl.start < 0){
        ctrl.start = 0;
    }
    UIplayTrack(ctrl.active-1);
}

//////////////////////////////////////////////////////////////////////////////
// step sequencer and midi file player

playerBit.prototype = Object.create(control.prototype);

function playerBit(bit)
{	control.call(this, bit);
	this.bit = bit;
    this.transport = new transport();
    this.gate = 128;
    this.gridRows = 48;         // notes in grid.
    this.bar = 0;
    this.bars = 12;
    this.beat = 0;
    this.beats = 4;
    this.page = 0;          // one screens worth
    this.start = 0;
    this.oddColor = "#000000";
    this.evenColor = "#808080";
    this.cursorColor = "#c0c0c0";
    this.max = 0;
    this.step = 0.0;
    this.octave = 3;
    this.playing = new Array( this.gridRows+2);
    this.grid = new Uint8Array( this.bars * this.beats * this.gridRows);
    this.values = new Array(this.bars * this.beats);
    this.tracklist = null;
    this.filename = "";
    this.active = 0;        // active track / channel
    this.drawmode = 0;      // 0 grid, 1 lines
    this.mididev = -1;      // which midi input ?
    this.id = 0;            // for midiinobject
    this.name = "Player";
    this.noteStates = new Array( this.gridRows+2);
    this.curcol = new delta();
    this.ppq = g_ppqn;

    //player
    this.setup = function()
    {   let i;
        
        UIchooseKit("Midi");            // make sure Midi kit is init.

        for(i=0; i < this.playing.length; i++){
            this.playing[i] = 0;
        }

        // midi stuff
        for(i=0; i < this.noteStates.length; i++){
            this.noteStates[i] = 0;
        }
        this.curcol.changed(-1);

        // bit output stuff
        for(i=0; i < this.values.length; i++){
            this.values[i] = 0;
        }
    
        // grid setup
        for(i=0; i < this.grid.length; i++){
            this.grid[i] = 0;
        }
    
        this.max = this.bars * this.beats;
        this.setTempo(120);
        this.transport.resume();

        if( this.mididev == -1){
            useMIDIin = new MIDIinputobj(this);
            this.mididev = nextMidiIndex;       // setup by midiinputobj
            useMIDIin.setup("Player");
        }
        
    }

    // 
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
            debugmsg("setnote range "+note+" octave="+(this.octave*12));
            return 0;
        }

        cnt = 0;
        for(i=0; i < this.gridRows; i++){
            if( this.grid[col + i* perrow] != 0){
                cnt++;
            }
        }
        return prev;

//        debugmsg("setNote "+note+" "+col+" ");
    }

    this.Draw = function()
    {   const bit = this.bit;
        const kw = bit.w/5;
        const kh = bit.h;
        let i,j;
        let bw, bh;
        let dx, dw;

        bw = Math.floor( (bit.w-kw )/ this.gridRows);
        bh = Math.floor( (bit.h )/ this.gridRows);

        ctx.strokeStyle = "#0000ff";
        ctx.strokeRect(bit.x,bit.y, bit.w, bit.h);

        this.drawKeyboard();
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
        if( this.drawmode == 0){
            for(i=kw; i < bit.w-bw; i += bw){
                ctx.strokeRect(bit.x+i, bit.y+0, bw, kh);
            }
        }
        for(i = 0; i < bit.h-bh; i += bh){
            ctx.strokeRect(bit.x+kw, bit.y+i, bit.w-kw, bh);
        }
        // draw notes
        if( this.tracklist == null){
            ctx.fillStyle = "#ffffff";
            for(i=0; i < this.beats*this.bars; i++){
                    for(j = this.gridRows-1; j >= 0; j--){
                        dx = i + j * this.beats*this.bars;
                        if( this.grid[ dx] > 0){
                            ctx.fillRect(bit.x+kw+i*bw, bit.y+j*bh, bw, bh);
                        }
                    }
            }
        }

        if( this.tracklist != null){
            // draw tracks
            this.drawTrack(this.active-1, "#ffff00");
        }

        // draw bar marker
        dx = kw+(this.bar * this.beats+this.beat) * bw;
        ctx.strokeStyle=this.cursorColor;
        ctx.strokeRect(bit.x+dx, bit.y, bw, bit.h);

        drawmode = 2;
        execmode = 2;
    }

    this.drawKeyboard = function()
    {   const bit = this.bit;
        const kw = bit.w/5;
        const kh = bit.h;
        const bnw = Math.floor(kw/2);
        const bnh = Math.floor(kh/this.gridRows);
        let dx,dw;
        let i,j;
        let note;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bit.x, bit.y, kw, kh);
        // draw black notes
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

    }

    this.findTrack = function(track)
    {   let t = this.tracklist;

        while(t != null){
            if( t.track == track){
                break;
            }
            t =t.next;
        }
        return t;
    }

    this.skipEvents = function( eventList, start)
    {   let ev;
        let now = 0;

        ev = eventList;
        // skip to first note visible.
        while(ev != null){
            if( now >= start){
                break;
            }
            now += ev.delta;

            ev = ev.next;
        }
        return ev;

    }

    // player
    this.drawTrack = function(track, color)
    {   let t;
        const bit = this.bit;
        let now = 0;
        let ev = null;
        let start = this.start *this.ppq;
        const end = this.beats * this.bars * this.ppq;
        let cmd;
        let starts = new Array(128);
        let i;
        let row;
        let kw = bit.w/5;
        const bh = Math.floor(bit.h / this.gridRows);
        const bw = Math.floor( (bit.w-kw )/ this.gridRows);
        const bw96 = bw / this.ppq;
        let x;
        let w;
        let r;

        for(i=0; i < 128; i++){
            starts[i] = 0;          // all notes are off
        }

        t = this.findTrack(track);
        if( t == null){
            return;
        }
        ev = t.eventlist;
        now = -start;
        while(ev != null){
            now += ev.delta;
            cmd = Math.floor(ev.status / 16);
            if( cmd == 9){
                starts[ev.data] = now;
            }else if( cmd == 8 || now >= end){      // note off or end of grid.
                // end of note.
                if( starts[ev.data] != 0){
                    // drawline
                    row = ev.data - this.octave*12;
                    row = this.gridRows - row - 1;
                    row = row * bh;
                    x = Math.floor(starts[ev.data] * bw96);
                    w = Math.floor((now - starts[ev.data])  * bw96);
                    r = x+w;
                    if( x < 0){
                        w = w + x;
                        x = 0;
                    }

                    if( x < bit.w-kw && r < bit.w-kw && r > 0){
                        ctx.fillStyle = color;
                        ctx.fillRect(bit.x+x+kw, bit.y+row+2, w, 2);
                    }
                }
            }
            ev = ev.next;
        }
    }

    // 
    this.newColumn = function()
    {   let col;
        let i;
        let n;
        let perrow = this.beats*this.bars;

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

    // player
	this.setValue = function(data, chan)
	{   let beat;
        let col=this.beat+this.bar*this.beats;
        let perrow = this.beats*this.bars;

        if( this.max >= perrow){
            this.max = perrow;
        }

        if( chan == 0){     
            this.bit.value = this.values[col]+this.values[col];
            this.doMidi();
            this.doPlay();
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
                            this.page++;
                        }
                    }
                    // new column
                    this.newColumn();

                }

//                debugmsg("Player "+this.step+" "+this.beat);
			}else if( data == 0){       //  paused 
                this.transport.stop();
            }else {		
                this.transport.stop();
                col = Math.floor(data/ 256 * (this.beats*this.bars) );
                this.beat = col % this.beats;
                this.bar = Math.floor(col / this.beats);
                this.newColumn();
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
        let tl;
        let n;
        let style = "";

		if( bitform != null){
			bitform.innerHTML="";
		}
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";
            if( this.tracklist != null){
                msg += "<tr><th colspan='2' >Midi file </th><td colspan='2' >"+this.filename+"</td></tr>\n";
                tl = this.tracklist;
                while(tl != null){
                    if( this.active-1 == tl.track){
                        style = " style='color:green' ";
                    }else {
                        style = " onclick='UIplayTrack("+tl.track+");' style='cursor:pointer;' ";
                    }
                    msg += "<tr><th><span "+style+">"+tl.track+"</span></th><th align='left' ><span "+style+">"+tl.name+"</span></th>";
                    if( tl.hasnotes == 1){
                        msg += "<td><select id='groupname_"+tl.track+"' >"+listMidiGroups(0, tl.midioutdev)+"</select></td>";
                        msg += "<td>"+tl.firstnote+"</td>";
                        msg += "<th>Yes</th>";
                    }else {
                        msg += "<td></td>";
                        msg += "<td></td>";
                        msg += "<th>No</th>";
                    }
                    msg += "</tr>\n";
                    tl = tl.next;
                }
            }
            msg += "<tr><th>Beats</th><td><input type='text' id='beats' size='3' value='"+this.beats+"'  onchange='UIrefresh(1, 0);' /></td>";
            msg += "<th>Bars</th><td><input type='text' id='bars' size='3' value='"+this.bars+"' onchange='UIrefresh(1, 0);'  ></input></td></tr>\n";
            // start position
            msg += "<tr><th><input type='button' value='<<' onclick='UIstartPos(-4);' /></th><th><input id='startposition' type='text' value='"+this.start+"' size='3'/></th>";
            msg += "<th><input type='button' value='>>' onclick='UIstartPos(4);' /></th></tr>\n";
			msg += "<tr><th>Tempo</th><td colspan='2'><input type='text' id='tempo' value='"+this.transport.tempo+"'  size='4'  onchange='UIrefresh(1, 0);' /></td>\n";
			msg += "<th>Gate</th><td colspan='2'><input type='text' id='gate' value='"+this.gate+"'  size='4'  onchange='UIrefresh(1, 0);' /></td>\n";
            msg += "<tr><th>Debug</th><td>"+this.mididev+"</td></tr>\n";
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
        let t;

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
        if( this.tracklist != null){
            t = this.tracklist;
            while(t != null){
                f = document.getElementById("groupname_"+t.track);
                if( f != null){
                    s.addarg("groupname_"+t.track);
                    s.addarg(f.value*1);
                }

                t = t.next;
            }
        }

        this.doLoad( s.getdata(), 0);
    }

    this.doLoad = function(initdata, idx)
	{	var len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";
        let tempo = this.transport.tempo;
        let t;
        let gn;
        let md;

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
			}else {
//                debugmsg("Load "+param+" "+val);
                t = this.tracklist;
                if( t != null){
                    while(t != null){
                        if( param == "groupname_"+t.track){     // interface name actually
                            if(t.midioutdev != val){
                                debugmsg("Group "+(t.midioutdev-1)+" "+val);
                                md = getMidiOutGroup(t.midioutdev-1);
                                if( md != null){
                                    t.midiout = md.name;
                                }
                            }
                        
                            t.midioutdev = 1*val;
                            if( t.player != null){
                                t.player.midioutdev = t.midioutdev+1; // player is 1 offset
                            }
                            break;
                        }
                        t = t.next;
                    }
                }
            }

        }
        if( this.transport.tempo != tempo){
            this.setTempo(tempo);
//            debugmsg("Tempo "+tempo);
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

        if(  x > kw+perrow*bw){
            debugmsg("Past end");
            return;
        }

        if( x > kw ){
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

    this.loadTrackList = function(tr, name)
    {   let t;
        this.tracklist = tr;
        this.filename = name;

        if( this.mididev != -1){
            MIDIindev[this.mididev].name = name;
        }

        t = tr;
        while(t != null){
            if( t.tempo != 0){
                this.setTempo(t.tempo);
            }
            if( t.hasnotes != 0){
                if( this.active == 0){
                    this.active = t.track+1;        // 1 origin
                }
                t.player = new trackPlayer(t);
            }
            t = t.next;
        }
        if( this.active == 0){
            debugmsg("No notes");
            return;
        }
//        if( this.active != 0){
//            this.loadTrack(t, this.start);     // load track into grid
//        }
        
        this.ppq = g_ppqn;      // modified by parsetrack
        debugmsg("SET PPQN "+g_ppqn);

    }

    this.loadTrack = function(track, start)
    {   let t = track;
        let ev;
        let cmd;
        let chan;
        let tick = 0;
        let beat = 0;
        let bar = 0;
        let allnotes = new Array(128);
        let i;
        let row;
        let w;
        let now = 0;
        let hasnote = false;        // used to flag if need to output
        let perrow = this.beats * this.bars;

        for(i=0; i < 128; i++){
            allnotes[i] = 0;        // not sounding
        }

        if( t == null){
            return;
        }

        debugmsg("Load track "+track+" "+t.name+" start "+start);
        // load grid from event data
        ev = t.eventlist;
        now = 0;   
        start = start * this.ppq;     // convert to pqn
        if( now < start){
            debugmsg("Start "+Math.floor(start/ this.ppq));
            // skip
            while( ev != null){
                now += ev.delta;
                if( now >= start){
                    break;
                }
                ev = ev.next;
            }
            debugmsg("End skip now="+Math.floor(now/this.ppq) );
        } 
        
        now = 0;        // restart track output position
        while(ev != null){
//            debugmsg("Event "+ev.delta+" "+ev.status.toString(16)+" "+ev.data.toString(16));
            cmd = Math.floor(ev.status / 16);
            chan = ev.status % 16;
            now += ev.delta;
            
//            if( now <= tick){
                if( cmd == 9){        // note on
                    debugmsg("Event("+now+") "+tick+" On "+ev.delta+" "+ev.status+" note="+ev.data+" "+ev.arg);
                    if( Math.floor(now / this.ppq) < perrow){ // start is still on screen
                        allnotes[ev.data] = now;
                    }
                    hasnote = true;
                }else if( cmd == 8 ){
//                    allnotes[ev.data] = 2;
                    debugmsg("Event("+now+") "+tick+" Off "+ev.delta+" "+ev.status+" note="+ev.data);
                    if( allnotes[ev.data] != 0){
                        row = ev.data - this.octave*12;
                        row = this.gridRows - row-1;
                        row = row * perrow;
                        i = Math.floor(allnotes[ev.data]/this.ppq);
                        w = Math.floor((now - allnotes[ev.data]) / this.ppq);
                        debugmsg("Grid "+row+" "+i+" "+w);
                        while( w > 0){
                            this.grid[row+i] = 1;
                            i++;
                            w--;
                            if( i >= perrow){
                                break;
                            }
                        }
                    }
                    allnotes[ev.data] = 0;

                }
//            }
            ev = ev.next;
        }
        while( ev != null){
            now += ev.delta;
            ev = ev.next;
        }
        debugmsg("Done "+beat+" "+bar+" now="+now);

    }

    // player
    this.doMidi = function()
    {   let col=this.beat+this.bar*this.beats;
        const perrow = this.beats*this.bars;
        let n;
        let len = this.gridRows;
        let note;
        let row;
        let octave = this.octave * 12;

        if( this.tracklist != null && this.drawmode != 0){
            return;
        }
        // changed column?
        if( this.curcol.changed(col) ){
            // off old notes
            row = 0;
            for(n=0; n < len ; n++){
                note = this.grid[col + row];
//                debugmsg("Col="+col+" "+note+" row="+row+" n="+n);
                if( this.noteStates[n] != 0 ){
                    // noteOff;
//                    debugmsg("Off Col="+col+" "+note+" row="+row+" n="+n);
                    this.noteoff(8, 0, this.gridRows - n + octave - 1, 127, this.mididev);
                    this.noteStates[n] = 0;
                }
                // new note?
                if( note != 0){
//                debugmsg("On Col="+col+" "+note+" row="+row+" n="+n);
                    this.noteon(9, 0, this.gridRows - n + octave - 1, 127, this.mididev);
                    this.noteStates[n] = 1;
                }

                row += perrow;
            }
        }
    }

    this.doPlay = function()
    {   let now = 0;
        let t = this.tracklist;
        let stillplaying = true;

        if( this.tracklist == null){
            return;
        }
        this.step = this.transport.getValue();
        this.transport.trigger = 0;
        now = ((this.step/(256/this.beats)) + this.bar*this.beats + this.page * this.bars*this.beats)*this.ppq;

//        if( now < this.ppq*8){
//            debugmsg("doplay '"+now+"' step='"+this.step+"'");
//        }
        stillplaying = false;
        while(t != null){
            if( t.player != null){
                t.player.play(now);
                if( t.player.curevent != null && t.player.midioutdev != 0){
                    stillplaying = true;
                }
            }
            t = t.next;
        }
        if( stillplaying == false){
            debugmsg("Finished.");
            t = this.tracklist;

            while(t != null){
                if( t.player != null){
                    t.player.start();
                }
                t = t.next;
            }
            this.page = 0;
            this.beat = 0;
            this.bar = 0;
    
        }

    }

    this.noteon = function(op, chan, arg, arg2, dev)
    {   const md = MIDIindev[dev];
        debugmsg("On("+arg+") "+dev);
        midiinsetvalues(1, chan, arg, arg2, dev);
    }

    this.noteoff = function(op, chan, arg, arg2, dev)
    {   const md = MIDIindev[dev];
     
        debugmsg("Off("+arg+") "+dev);
        midiinsetvalues(0, chan, arg, arg2, dev);

    }

    this.setup();

    timer_list.addobj(this.transport, null);
	this.transport.name = "Player-transport";		// for debugging

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
    this.midioutdev = 0;        // use 1 offset so 0 is not set.
    this.output = null;

//    debugmsg("trackplayer "+data.name+" "+data.track);

    this.start = function()
    {   let g;

        this.period = 0;
        if( data.eventlist != null){
            this.period=data.eventlist.delta;
            this.curevent = data.eventlist;
        }
    }

    this.play = function(now)
    {   let ev = this.curevent;
        let cmd;
        let chan;
        let outdev = null;
        let md = null;
        let g;
        let msg = [ 0x90, 60, 127];
        let sent = false;
        
        if( this.output == null){
            g = getMidiOutGroup(this.midioutdev-1);      // use 1 offset
            if( g == null){
                return;
            }
            if( g.outdev == null){
                    if(localOut == null){
                        useMIDIout = new MIDIoutputobj(null);
                        useMIDIout.output = new localMidiOut();
                        localOut = useMIDIout;
                        MIDIoutdev_list.addobj(localOut, null);
                    }
                    this.output = localOut.output;
            }else{
                this.output = g.outdev.output;
            }
        }
        outdev = this.output;
//        debugmsg("Now "+now+" "+this.period);
        
        while( this.period <= now && ev != null){
            cmd = ev.status & 0xf0;
            chan = ev.status & 0xf;
//            debugmsg("Now "+now+" "+this.period+" "+cmd.toString(16)+" "+chan+" delta="+ev.delta+" dev="+this.midioutdev);
            if( cmd == 0x90 || cmd == 0x80 || cmd == 0xb0 || cmd == 0xe0){
                msg[0] = ev.status;
                msg[1] = ev.data;
                msg[2] = ev.arg;
            }
            if( msg[1] > 127 || msg[2] > 127){
                debugmsg("Error code "+ev.status.toString(16)+' '+msg[1].toString(16)+" "+msg[2].toString(16));
                cmd = 0xfe;
            }
            sent = false;
            if( cmd == 0x90){
                // note out
                if( ev.arg != 0){
//                    debugmsg("Player ON("+chan+") "+ev.data+" "+ev.arg);
                    outdev.send(msg);
                }else {
                    cmd = 0x80;
                    msg[0] = chan | cmd;
                    msg[2] = 127;
                }
                sent = true;
            }
            if( cmd == 0x80){
                // note out
//                debugmsg("Player OFF("+chan+") "+ev.data);
                outdev.send(msg);
                sent = true;
                this.output = null;     // check for updates after note
            }
            if( cmd == 0xb0 || cmd == 0xe0){
                outdev.send(msg);
                sent = true;
            }
            if( sent == false){
                debugmsg("Player not sent "+ev.status.toString(16));
            }
            ev = ev.next;
            if( ev != null){
                this.period += ev.delta;
            }
        }
        this.curevent = ev;

    }

    this.start();       // init first time
}


