// player.js
//

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


