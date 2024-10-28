/// base functionality used by the keyboard.js and midi.js components.
//
//

var xdebugmsg="";
var xdebugmsg2="";

function startdebug()
{ var d = document.getElementById("debugmsg");
	if( d != null){
	  d.innerHTML = "Debug:<br /> Mode="+mode+" Bytes="+datalen+"<br />\n";
	}
}

function debugmsg(p, l, msg)
{ var d = document.getElementById("debugmsg");
  var dmsg = ""+p+" "+l+" "+msg;

  if( mididebug == 1 && d != null){
	  d.innerHTML += dmsg+" "+ hexof(p, l)+"<br />\n";
  }
}

///////////////////////////////////////////////////////////////
function objfactory(name, func)
{	this.name = name;
	this.makefunc = func;

	this.istype = function( name)
	{
		return name == this.name;
	}

	this.create = function( parent)
	{	var tmp = new this.makefunc(parent);

		tmp.typename = this.name;
		return tmp;
	}
}


/////////////////////////////////////////////////////////////////

function process()
{	
//alert("Do load scenes");
	loadscenes();		// load the data and run.

//	alert("Scenes loaded");
	setInterval(timer_doTimers, timerval);
	requestAnimationFrame( doAnimation);

}

////////////////////////////////////////////////////////////////////////////

var debugticks = 0;

function showdebug()
{	var d = document.getElementById('debugmsg');

	if( d != null){
		d.innerHTML = ""+xdebugmsg+"<br>\n"+xdebugmsg2+"<br>\n";
	}

}

function timer_doTimers()
{	var ol;
	var msg="";

	debugticks++;
	if( debugticks == 10){
		debugticks = 0;

		showdebug();
	}

	ol = timer_list.head;
	while(ol != null){
		if( ol.ob.timer(ol.data)){
			timer_list.removeobj(ol);
		}
		ol = ol.next;
	}
}

///////////////////////////////////////////////////////////////////////////

 ////////////////////////// base64 conversions
 ///

var base64tab ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function base64Encode( datain )
{	var output = "";
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var i = 0;
	var cnt;

 
	while (i < datain.length) {
		cnt = 1;
		chr2 = 0;
		chr3 = 0;
		chr1 = datain[i++];
		if( i < datain.length ){
			chr2 = datain[i++];
			cnt++;
		}
		if( i < datain.length ){
			chr3 = datain[i++];
			cnt++;
		}
 
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		if( cnt > 1){
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			if( cnt > 2){
				enc4 = chr3 & 63;
			}else {
				enc4 = 64;
			}
		}else {
			enc3 = enc4 = 64;
		}
 
 
		output = output +
		base64tab.charAt(enc1) + base64tab.charAt(enc2) +
		base64tab.charAt(enc3) + base64tab.charAt(enc4);
 
	}
	return output;
}

function base64Decode( datain)
{
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;
 
	input = datain.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
	while (i < input.length) {
 
		enc1 = base64tab.indexOf(input.charAt(i++));
		enc2 = base64tab.indexOf(input.charAt(i++));
		enc3 = base64tab.indexOf(input.charAt(i++));
		enc4 = base64tab.indexOf(input.charAt(i++));
 
		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
 
		output = output + String.fromCharCode(chr1);
 
		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}
 
	}
 
	return output;
 }

///////////////////////////////////////////////////////////////
///////

function findscene( scene)
{	var sl = scene_list.head;

	while( sl != null){
		if( sl.ob.cnvs == scene){
			return sl.ob;
		}
		sl = sl.next;
	}
	return null;
}

function findscenebyname( scenename)
{	var sl = scene_list.head;

	while( sl != null){
		if( sl.ob.name == scenename){
			return sl.ob;
		}
		sl = sl.next;
	}
	return null;
}

// table structure
// "type", nargs, args
//

function loadscenes()
{	var idx, idx2, idxend;
	var tmp;
	var sl;
	var cl;
	var name, layout;


	if( scene_list.head == null){
		idx = 0;
//		alert("loadscenes");
		while( scenes[idx] != ""){
			if( scenes[idx] == "scene"){
				tmp = new scene( null);
				tmp.load(scenes, idx);
				tmp.postload();			// scene postload
				scene_list.addobj( tmp, null);
			}

			idx = scenes[idx+1]+idx+2;
		}

		// run the scenecontrollers post load since they cannot be run until 
		// everything loaded
		sl = scene_list.head;
		while(sl != null){
			cl = sl.ob.controllerlist.head;
			while( cl != null){
				cl.ob.postload();	// run scenecontroller post load function.
				cl = cl.next;
			}
			sl = sl.next;
		}

		// run the localpostload
		sl = scene_list.head;
		while(sl != null){
			cl = sl.ob.controllerlist.head;
			while( cl != null){
				cl.ob.localpostload();	// run scenecontroller localpost load function.	mostly setinitvalues
				cl = cl.next;
			}
			sl = sl.next;
		}
	}

}


//////////////////////////////////////////////////////////////

function doAnimation()
{	var al = animation_list.head;

	while(al != null){
		al.ob.Draw();
		al = al.next;
	}
	requestAnimationFrame( doAnimation);

}
