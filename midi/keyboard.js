//////////////////////////////////////////////////////////////////////////////////////
//	By Peter Churchyard
// keyboard.js

var object_list = new objlist();

function findPos( obj)
{	var bodyRect = document.body.getBoundingClientRect(),
		elemRect = obj.getBoundingClientRect();
    return [elemRect.left - bodyRect.left, elemRect.top - bodyRect.top ];
}

function scale( x, y)
{
	return x/y;
}

/////////////////////////////////////////////////////////////
// a scene has a canvas
// a scene controller handles scene objects
// a scene has list of scene controllers.
// a scenecontroller is a type of sceneobj
//
// when you click on an object it becomes the selected one.
//

function scene( name)
{	this.name = name;
	this.controllerlist = new objlist();
	this.cnvs = null;
	this.width = 0;
	this.height = 0;
	this.ctx = null;
	this.left = 0;
	this.top = 0;
	this.mx = 0;
	this.my = 0;
	this.selected = null;
	this.type = 0;		// scene == 0, controller == 1, obj == 2

	this.timer = function()
	{
		return true;
	}

	// scene.load
	//
	this.load = function( data, idx)
	{	var args = data[idx+1];
		var name="";
		var val="";

		idx = idx+2;
		while(args > 0){
			name = data[idx];
			val = data[idx+1];
			if( name == "name"){
				this.name = val;
			}else if( name == "layout"){
				this.layout = val;
			}

			idx = idx + 2;
			args = args - 2;
		}
	}

	//scene.postload
	//
	this.postload = function()
	{
		if( this.name == null || 
			this.layout == null){
			// missing args
			alert("Scene missing required args");
			return;
		}

		// get the canvas data
		if( !this.initcanvas() ){
			// failed to load canvas
			alert("Failed to init canvas("+this.name+"_canvas)" );
			return;
		}

		this.loadcontrollers( this.layout);
		this.setctx();

		this.dumpscene();
	}

	this.initcanvas = function()
	{	var msg="";
		this.cnvs = document.getElementById(this.name+"_canvas");

		if( this.cnvs == null){
			return false;		// try again
		}

		this.ctx = this.cnvs.getContext('2d');
		this.ctx.font="12px Georgia";
		this.ctx.scale(1, 1);

		this.width = parseInt( this.cnvs.style.width);
		this.height= parseInt( this.cnvs.style.height);

		this.cnvs.onmousedown = this.MouseDown;
		this.cnvs.onmousemove = this.MouseMove;
		this.cnvs.onmouseup = this.MouseUp;
		this.cnvs.ondblclick = this.DblClick;
		this.cnvs.onkeyup = KeyUp;
		this.cnvs.onkeydown = KeyDown;
		this.cnvs.onmouseout = this.MouseOut;

		this.cnvs.addEventListener('touchstart', 
			function(e){
				var touchobj;
				var kbd = findscene(this);

				if( 1 == e.targetTouches.length){
					touchobj = e.targetTouches[0];
					kbd.mx = Math.floor(touchobj.pageX)-kbd.left;
					kbd.my = Math.floor(touchobj.pageY)-kbd.top;
//				xdebugmsg = "Touch start "+kbd.mx+" "+kbd.my;

					kbd.doMouseDown();
					e.preventDefault();
				}
			}, false);
 
		this.cnvs.addEventListener('touchmove', function(e){
				var touchobj;
				var kbd = findscene(this);

				if( 1 == e.targetTouches.length){
					touchobj = e.targetTouches[0];
	//				mx = parseInt(touchobj.pageX);
	//				my = parseInt(touchobj.pageY);
					kbd.mx = Math.floor(touchobj.pageX)-kbd.left;
					kbd.my = Math.floor(touchobj.pageY)-kbd.top;
					kbd.doMouseMove();
//				xdebugmsg = "Touch move "+kbd.mx+" "+kbd.my;
					e.preventDefault();
				}
			}, false);
 
		this.cnvs.addEventListener('touchend', function(e){
				var touchobj;
				var kbd = findscene(this);

					kbd.doMouseUp();		// use last x,y
//				xdebugmsg = "Touch end "+kbd.mx+" "+kbd.my;
					e.preventDefault();
			}, false);
 
		this.findpos();

		return true;
	}

// these event routines are called with canvas as this.
//
// need to find the last (top) hit object.
// scene.mouseDown
    this.doMouseDown = function() {
	   var ol = this.controllerlist.head;
	   var hit;
	   var selected = null;
	   var sx, sy;

	   this.cnvs.focus();

	   while(ol != null){
			hit = ol.ob.HitTest(this.mx, this.my);
			if( hit != null ){
				selected = hit;
				sx = this.mx;
				sy = this.my;

			}
			ol = ol.next;
	   }
	   if( selected != null){
		this.sx = sx;
		this.sy = sy;
		xdebugmsg ="Down "+selected.typename+"/"+selected.name+" "+this.mx+" "+this.my;
//				hit.Draw();

		this.selected = selected;
		selected.scene = this;
		selected.mouseDown(this.mx, this.my);
		selected.clicked(this);
	   }else {
		// nothing hit
		xdebugmsg ="Down nothing "+this.mx+" "+this.my;
			this.unclicked();
	   }
       return false;
    }

    this.MouseDown = function(e) {
		var kbd = findscene(this);
        kbd.getXY(e);

		return kbd.doMouseDown();
	}

	// scene.doMouseMove
    this.doMouseMove = function() 
	{	var hit = null;
		var sel = null;

//		xdebugmsg2 = "scene:doMove "+this.mx+" "+this.my;
//		showdebug();
		if( this.selected != null){
//			xdebugmsg2 = "SCENE MOVE "+this.selected.name;
			this.selected.mouseMove(this.mx, this.my);
			return;
		}else {
//			xdebugmsg2 = "SCENE MOVE not selected";
		}
    }

    this.MouseMove = function(e) {
		var kbd = findscene(this);
        kbd.getXY(e);
		return kbd.doMouseMove();
	}

    this.doMouseUp = function() 
	{
		if( this.selected != null){
			xdebugmsg2 = "SCENE UP "+this.selected.name;
			this.selected.mouseUp(this.mx, this.my);
		}else {
			xdebugmsg2 = "SCENE UP not selected";
		}
		this.selected = null;
    }

    this.MouseUp = function(e) {
		var kbd = findscene(this);
        kbd.getXY(e);
		kbd.doMouseUp();
	}

    this.DblClick = function(e) {
		var kbd = findscene(this);
    }

	this.MouseOut = function(e)
	{	var kbd = findscene(this);
    
//		xdebugmsg = "Mouse out";
        kbd.getXY(e);
		kbd.doMouseUp();
	}

	// scene.keypress
	// this == scene
    this.KeyPress = function(key, dwn) {
		var k =0;
		var ol ;
		var code = "";

		while( keymap[k][1] != 0){
		    if( keymap[k][1] == key){
				code = keymap[k][0];
				break;
			}
			k++;
		}
		xdebugmsg = "code='"+code+"' dwn="+dwn+" key="+key;
		if( code != ""){
			ol = this.controllerlist.head;
			while(ol != null){
				ol.ob.KeyPress(code, dwn);
				ol = ol.next;
			}
			return false;
		}
		if( key == 68 && dwn==1){
			this.dumpscene();
		}
		if( key == 66 && dwn == 1){
			this.dumpbitlist();
		}
		return true;
    }

	this.getXY = function(e) {
		var rc = e.target.getBoundingClientRect();
		this.mx = Math.floor(e.clientX - rc.left);
		this.my = Math.floor(e.clientY - rc.top);
		if (this.mx < 0) this.mx = 0;
		if (this.my < 0) this.my = 0;

	//	xdebugmsg="mx="+this.mx+" my="+this.my;
	}

	this.unclicked = function()
	{	var cl = this.controllerlist.head;
		while(cl != null){
			cl.ob.unclicked();
			cl = cl.next;
		}
	}


	// scene.loadcontrollers
	// layout format
	// type, nargs, args
	// called after init canvas
	//
	this.loadcontrollers = function( layout)
	{	var idx = 0;
		var tmp;

		while( layout[idx] != ""){
			tmp = null;
			if( layout[idx] == "keyboard"){
				tmp = new keyboard( );
			}else if( layout[idx] == "scenecontroller"){
				tmp = new scenecontroller( );
			}else if( layout[idx] == "softbitslive"){
				tmp = new Sketch( );
			}
			if( tmp != null){
				this.controllerlist.addobj( tmp, null);
				tmp.scenename = this.name;
				tmp.scene = this;		// 

				tmp.l = 0;
				tmp.t = 0;
				tmp.w = this.width;
				tmp.h = this.height;
				tmp.r = tmp.l+tmp.w;
				tmp.b = tmp.t+tmp.h;
				tmp.load( layout, idx);
				tmp.loadcontrols();
			}

			idx = idx+2+layout[idx+1];
		}

		// post load
	}

	//scene.setctx
	this.setctx = function()
	{	var cl = this.controllerlist.head;
		while( cl != null){
			cl.ob.scene = this;
			cl.ob.setctx(this.ctx);
			cl.ob.Draw();		// draw controller..

			cl = cl.next;
		}
	}

	this.findpos = function()
	{
		var pos = findPos( this.cnvs);
		this.left = pos[0];
		this.top = pos[1];
	}

	// debugging routine.
	//
	this.dumpscene = function()
	{	var d = document.getElementById("dump");
		var msg = "<p>scene "+this.name;
		var cl = this.controllerlist.head;

		if( d == null){
			return;
		}

		if( this.selected == null){
			msg+= " selected=null";
		}else {
			msg += " selected="+selected.name;
		}
		msg += "</p>\n";

		while(cl != null){
			msg += "<div class='box'>\n";
			msg += cl.ob.dump();
			msg += "</div>\n";
			cl = cl.next;
		}
		
		d.innerHTML = msg;
		d.focus();
//		alert("dumpscene");
	}

	this.dumpbitlist = function()
	{	var d = document.getElementById("dump");
		var msg = "<p>Bitlist scene "+this.name;
		var sketch = findsketch("softbitslive", "softbitslive");
		var bl = sketch.blist;

		if( d == null){
			return;
		}

		msg += bl.dump();

		d.innerHTML = msg;
	}

	// scene.targetmatch
	// first arg is the target value in the object
	// 2nd arg is the linkto pattern
	// if exact match then return true.
	// if target has a minus sign only match up to the minus.
	//  EG CC-21 matches CC
	//

	this.targetmatch = function(target, pat)
	{	var len;
		var len2;
		var i;

		if( target == null || pat == null){
			return false;
		}

		if( target == pat){
			return true;
		}
		len = target.length;
		len2= pat.length;
		
		if( len2 > len){
			return false;
		}
		
		i = 0;
		while( i < len2){
			if( target.charAt(i) != pat.charAt(i)){
				return false;
			}
			i++;
		}
		return true;
	}

	this.findcontroller = function(name)
	{	var cl = this.controllerlist.head;

		while( cl != null){
			if( cl.ob.name == name){
				return cl.ob;
			}

			cl = cl.next;
		}
		return null;
	}
}

// scene.keydown (this == canvas)
function KeyDown(e) {
	var kbd = findscene(this);
    if (document.activeElement == kbd.cnvs) {
        return kbd.KeyPress(e.keyCode, 1);
    }
	return true;
}

// scene.keyup (this == canvas)
 function KeyUp(e)
 {
	var kbd = findscene(this);
    if (document.activeElement == kbd.cnvs ){
	    return kbd.KeyPress(e.keyCode, 0);
	}
	return true;
}

//////////////////////////////////////////////////////////////////////////////////
// base scene object
//
// scene object is a child of a scene controller
// drawing and hit testing is relative to the controller.

function sceneObject( parent)
{	this.name = "";
	this.label= "";
	this.l = 0;
	this.r = 0;
	this.t = 0;
	this.b = 0;
	this.w = 0;
	this.h = 0;
	this.h2= 0;
	this.w2= 0;
	this.ctx = null;
	this.changed = true;
	this.val = 0;
	this.linklist = null;	// if you link to more than one thing.
	this.style = 0;			// default style.
	this.color = "#c0c0c0";
	this.bgcolor = "#808080";
	this.bordercolor = "";
	this.bgimage = null;
	this.sx = 0;
	this.sy = 0;
	this.msensitivity = 255;
	this.target = null;
	this.test = "";
	this.marked = false;	// used to detect loops in the linktos
	this.vcount = 1;
	this.hcount = 1;
	this.comment = "";
	this.click = false;
	this.typename = "baseobject";
	this.parent = parent;		// the scene controller.
	this.scene = null;			// the scene we are in.
	this.type = 1;
	this.deg = Math.PI/180;
	this.orientation = 0;			// object orientation 0, 1, 2, 3

	this.setorientation = function (o)
	{
		this.orientation = o & 3;
	}

	this.setcoords = function(x, y, w, h)
	{
		this.w = w;
		this.h = h;

		this.setXY(x, y);	// uses w, h

		this.w2 = Math.floor(w/2);
		this.h2 = Math.floor(h/2);
	}

	this.setXY = function(x, y)
	{	this.l = x;
		this.t = y;
		this.r = x + this.w;
		this.b = y + this.h;

	}

	this.relXY = function(dx, dy)
	{
		this.setXY( this.l+dx, this.t + dy);
	}

	// sceneObject.setctx
	this.setctx = function(ctx)
	{
		this.ctx = ctx;
	}

	this.Draw = function()
	{	var ctx = this.ctx;
		var x = 0;
		var y = 0;
		var w = this.w;
		var h = this.h;

		if( ctx == null){
			return;
		}

		ctx.save();
		
		ctx.translate( this.l, this.t);
		if( this.orientation != 0){
			ctx.rotate( this.orientation*90*this.deg);

			if( this.orientation == 1){
				w = this.h;
				h = this.w;
				y = -this.w;
				x = -5;
			}

		}

		if( this.bgcolor != ""){
			ctx.fillStyle = this.bgcolor;
			ctx.fillRect(x, y, w, h);
		}
		if( this.bgimage != null){
			this.ctx.drawImage(this.bgimage, x, y, w, h);
		}

		ctx.restore();
	}

	this.timer = function()
	{
//		xdebugmsg2 = "sceneObject timer "+this.name;
		if( this.changed){
			this.Draw();
			this.changed = false;
		}
		return false;
	}

	// sceneObject.hittest
	// x and y are relative to parent.
	//
	this.HitTest = function(x, y)
	{	var res = null;
		var i;
		
		if( x >= this.l && x <= this.r &&
		    y >= this.t && y <= this.b){
			res = this;
//			xdebugmsg = "Hit "+x+" "+y;
		}
		return res;	
	}

	this.mouseUp = function( x, y)
	{		xdebugmsg = "SOBJ UP "+this.name;

	}

	// val is 16 bit internally 0 - 65535
	//
	this.mouseMove = function(mx, my)
	{	
	xdebugmsg = "Obj mousemove "+mx+" "+my;
		if( this.scene == null){
	xdebugmsg = "Obj mousemove "+mx+" "+my+" scene == null";
		}else if( this.scene.selected == this){
		xdebugmsg2="selected";
			this.val += this.msensitivity*(this.sy - my);
			this.val -= this.msensitivity*(this.sx - mx);
			this.sy = my;
			this.sx = mx;

			if( this.val < 0){
				this.val = 0;
			}
			if( this.val > 65535){
				this.val = 65535;
			}
			this.setvalue(null, this.val);

//			xdebugmsg ="keyobj mouse move";
		}
	}

	// sceneObject.mouseDown
	this.mouseDown = function(mx, my)
	{	this.sx = mx;
		this.sy = my;
	}

	// default KeyPress handler
	this.KeyPress = function(e, dwn)
	{

	}

	// when changed by user update linked object.
	//
	this.linkto = function(link, linkarg)
	{
		if( this.linked == null){
			this.linked = new objlist();
		}
		this.linked.addobj(link);
		this.linkedarg = linkarg;
//		xdebugmsg2 = "Linkto "+link.target;
	}

	// sceneobj.setvalue
	this.setvalue = function( linkarg, val)
	{
		this.val = val;
		this.changed = true;
//		this.Draw();
		this.dosetvalue(null, this.val);

//		xdebugmsg = "keyobj "+linkarg+" setvalue "+val;
	}


	// sceneobj.sendinitvalue
	//
	this.sendinitvalue = function()
	{
	}


	// this is so complicated...
	// in the layout table I want it to be obvious
	// but that is not as easy as you would think
	// you can have multiple linkto. The linkarg is matched with the previous linkto.
	// there can be multiple targets for each linkto.
	//
	this.dosetvalue = function( linkarg, val)
	{	var sl, ll;
		var savedarg = linkarg;
		var scene;

		if( this.linklist == null){
			return;
		}

		if( linkarg == ""){
			linkarg = null;
		}

		ll = this.linklist.head;
		while(ll != null){
			if( this.scene == null){
	//			alert("oops");
			}
			
			// setup the scene to look at. This is stored in the linkfilter object.
			sl = ll.ob.linkedlist.head;
			scene = this.scene;
			if( sl != null && sl.ob.scene != null){
				scene = sl.ob.scene;
			}
			if( linkarg == null || scene.targetmatch( linkarg, ll.ob.linkpat)){

				// for each linkfilter
				while( sl != null){
					if( !sl.ob.marked ){
						sl.ob.marked = true;
						if( linkarg == null){
							// use the one from the filter.
							sl.ob.setvalue( ll.ob.linkarg, val);
						}else {
							sl.ob.setvalue( linkarg, val);
						}
						sl.ob.marked = false;
					}
					sl = sl.next;
					scene = this.scene;
					if( sl != null && sl.ob.scene != null){
						scene = sl.ob.scene;
					}
				}
			}
			ll = ll.next;
		}

	}


	this.setvalues = function( linkarg, chan, val)
	{
		this.val = val;
		this.changed = true;
		this.Draw();
//		xdebugmsg = "keyobj "+linkarg+" setvalues "+val[0];
	}

	this.dosetvalues = function( linkarg, chan, val)
	{	var sl, ll;
		var savedarg = linkarg;

		if( this.linklist == null){
			return;
		}

		ll = this.linklist.head;
		while(ll != null){
			if( savedarg == null){
				linkarg = ll.ob.linkarg;
			}

			if( this.scene.targetmatch( linkarg, ll.ob.linkarg)){

				sl = ll.ob.linkedlist.head;
				while( sl != null){
					if( !sl.ob.marked ){
						// if linkpat == target ok else 
						//   if linkarg == target
						if( ll.ob.linkpat == sl.ob.target ||
							linkarg == sl.ob.target){
							sl.ob.marked = true;
							sl.ob.setvalues( linkarg, chan, val);
							sl.ob.marked = false;
						}
					}
					sl = sl.next;
				}
			}
			ll = ll.next;
		}
	}

	this.getvalue = function( )
	{
		return this.val;
	}

	this.label = function(label)
	{
		this.label = label;
		this.changed = true;
	}

	this.setcolor = function (color)
	{
		this.color = color;
		this.changed = true;
	}

	this.sensitivity = function(s)
	{
		this.msensitivity = s;
	}

	this.loadsub = function(name, val)
	{
			if( name == "label"){
				this.label(val);
			}else if( name == "coords"){
				this.l = val[0];
				this.t = val[1];
				this.w = val[2];
				this.h = val[3];
			}else if( name == "color"){
				this.setcolor(val);
			}else if( name == "name"){
				this.name = val;
			}else if( name == "bgcolor"){
				this.bgcolor = val;
			}else if( name == "bordercolor"){
				this.bordercolor = val;
			}else if( name == "value"){
				this.val = val;
			}else if( name == "linkto"){
				if( this.linklist == null){
					this.linklist = new objlist();
				}
				this.linklist.addobj( new linkfilter(val), null);
			}else if( name == "linkarg"){
				// assume applies to previous linkto..
				this.linklist.head.ob.linkarg = val;
			}else if( name == "target"){
				this.target = val;
			}else if( name == "style"){
				this.style = val;
			}else if( name == "test"){
				this.test = val;
			}else if( name == "bgimage"){
				this.bgimage = new Image();
				this.bgimage.src = val;
			}else if( name == "hcount"){
				this.hcount = val;
			}else if( name == "vcount"){
				this.vcount = val;
			}else {
				this.loadlocal(name, val);
			}

	}

	// sceneobject.load
	this.load = function( data, idx)
	{	var args = data[idx+1];
		var name="";
		var val="";

		idx = idx+2;
		while(args > 0){
			name = data[idx];
			val = data[idx+1];
			this.loadsub( name, val);
			idx = idx + 2;
			args = args - 2;
		}
		// post load
	}

	// default loadlocal
	this.loadlocal = function(name, val)
	{
	}

	// output position values as fractions of canvas size.
	// sceneObject.savepos

	this.savepos = function()
	{	var msg = "";
		
		msg += " "+scale(this.l,this.scene.width)+", "+scale(this.t,this.scene.height)+", "+scale(this.w,this.scene.width)+", "+scale(this.h,this.scene.height)+", ";
		
		return msg;
	}

	this.saveattrs = function()
	{	var msg = "";
		var cnt = 0;
		var ll = null;

		msg += '"value", '+this.val+', ';
		cnt += 2;
		if( this.name != ""){
			msg += '"name", "'+this.name+'", ';
			cnt += 2;
		}
		if( this.label != ""){
			msg += '"label", "'+this.label+'", ';
			cnt += 2;
		}
		if( this.color != "#c0c0c0"){
			msg += '"color", "'+this.color+'", ';
			cnt += 2;
		}
		if( this.bgcolor != "#808080"){
			msg += '"bgcolor", "'+this.bgcolor+'", ';
			cnt += 2;
		}
		if( this.bordercolor != ""){
			msg += '"bordercolor", "'+this.bordercolor+'", ';
			cnt += 2;
		}
		if( this.msensitivity != 255){
			msg += '"sensitivity", '+this.msensitivity+', ';
			cnt += 2;
		}
		if( this.target != null){
			msg += '"target", "'+this.target+'", ';
			cnt += 2;
		}
		if( this.style != 0){
			msg += '"style", '+this.style+', ';
			cnt += 2;
		}
		if( this.test != ""){
			msg += '"test", "'+this.test+'", ';
			cnt += 2;
		}
		if( this.linklist != null){
			ll = this.linklist.head;
			while( ll != null){
				msg += '"linkto", "'+ll.ob.linkpat+'", ';
				cnt += 2;
				msg += '"linkarg", "'+ll.ob.linkarg+'", ';
				cnt += 2;

				ll = ll.next;
			}
		}

		return [cnt, msg];
	}

	this.save = function()
	{	var attrs = this.saveattrs();
		var lattrs= this.savelocal();
		return '"'+this.typename+'", '+this.savepos()+(attrs[0]+lattrs[0])+", "+attrs[1]+lattrs[1]+"\n";
	}

	this.savepatch = function()
	{	var msg = "";
		var cnt = 2;
		var sc = "";

		msg += "\"value\", "+this.val+", ";
		msg += "\"name\", \""+this.name+"\", ";
		if( this.scene != null){
			msg += "2, \"scene\", \""+this.scene.scenename+"\", ";
		}else {
			msg += "0, ";
		}

		msg += "\n";
		return msg;
	}

	this.savelocal = function()
	{
		return [0, ""];
	}

	///////////////////////////////////////////
	// getcolors - take string return rgb array
	//
	this.getcolors = function(color)
	{	var red = 255;
		var green = 255;
		var blue = 255;

		if( color == "red"){
			green = 0;
			blue = 0;
		}else if( color == "black"){
			red = 0;
			green = 0;
			blue = 0;
		}else if( color == "green"){
			red = 0;
			green = 255;
			blue = 0;
		}else if( color == "blue"){
			red = 0;
			green = 0;
			blue = 255;
		}else if( color == "white"){
			red = 255;
		}else {
			// convert #rrggbb
		}



		return [ red, green, blue];
	}

	// makecolor

	this.makecolor = function(colors)
	{	var msg = "#";

		msg += this.ashex( colors[0]);
		msg += this.ashex( colors[1]);
		msg += this.ashex( colors[2]);
		
		return msg;
	}

	this.ashex = function(n)
	{	var n2;
		var hexdigits="0123456789abcdef";
		
		n2 = Math.floor( (n & 0xf0) / 16);

		return hexdigits.charAt(n2)+hexdigits.charAt( n & 0x0f);
	}

	this.clicked = function(kbd)
	{
		this.click = true;
	}

	this.unclicked = function()
	{
		this.click = false;
	}

	this.localdumpobj = function()
	{
		return "";
	}
		
	this.dumpobj = function()
	{	var msg = "<p>obj "+this.name+"("+this.l+","+this.t+","+this.w+","+this.h+")<br />\n";

		msg += this.localdumpobj();

		if( this.bgimage != null){
			msg += " image="+this.bgimage.src+"<br />\n";
		}
		if( this.ctx == null){
			msg += " ctx is null";
			if( this.parent != null){
				if( this.parent.ctx == null){
					msg += " parent.ctx is null";
				}
			}else {
				msg += " parent is null";
			}
		}
		if( this.scene != null){
			if( this.scene.ctx == null){
				msg += " scene.ctx is null";
			}
			if( this.scene.selected == null){
				msg += " scene.selected = null";
			}
		}else {
			msg += " scene is null";
		}

		return msg+"</p>\n";

	}


	this.delobj = function(name)
	{
		this.parent.delobj(name);
	}

}

////////////////////////////////////////////////////////
//
// scenecontroller manages a list of sceneobj 
// scenecontroller is also a sceneobj
//
object_list.addobj( new objfactory("scenecontroller", scenecontroller) );

scenecontroller.prototype = Object.create(sceneObject.prototype);

function scenecontroller( )
{	sceneObject.call(this, null);
	this.name = null;
	this.parent = this;

	this.ctrllist = new objlist();
	this.mx=0;
	this.my=0;
	this.sx = 0;
	this.sy = 0;
	this.left = 0;
	this.top = 0;
	this.bgimage = null;
	this.bgcolor = "";
	this.imagesize=800;
	this.scale = null;
	this.removelist = new objlist();	// used to temp remove controls.
	this.slowtimer = 0;
	this.layout = null;
	this.scenename = null;
	this.scene = null;		// the canvas for this scene...
	this.lastclicked = null;	// last control clicked on
// from Bit
	this.bit = null;		// a token bit...
	this.snaps = [ null, null, null, null ];
	this.suffix = [ "-l", "-r", "-t", "-b" ];
	this.type = 2;

	this.ctrllist.addobj(this, null);	// scenecontroller is a sceneObject.

	// init the controller
	// called from sceneObject.load
	//
	this.loadlocal = function( name, val)
	{
		if( name == "name"){
			this.name = val;
		}else if( name == "layout"){
			this.layout = val;
		}else if( name == "scale"){
			this.scale = val;
		}else if( name == "imagesize"){
			this.imagesize = val;
		}
	}

	// scenecontroller.Draw
	//

	this.Draw = function()
	{	var cl, obj;
		var ctx = this.ctx;

		if( ctx == null){
			return;
		}

		if( this.orientation != 0){
			ctx.rotate(this.orientation*this.deg*90);
		}
		ctx.save();
		ctx.translate(this.l, this.t);

		if( this.bgcolor != ""){
	        ctx.fillStyle = this.bgcolor;
		    ctx.fillRect( 0 ,  0, this.w, this.h);
		}
		// xdebugmsg2="ctrl "+this.l+" "+this.t+" "+this.w+" "+this.h;

		if( this.bgimage != null){
			this.ctx.drawImage(this.bgimage, 0, 0, this.w, this.h);
		}
		this.ctx.restore();

		if( this.ctrl != null){
			this.ctrl.Draw();
		}
		// draw all the scene objects in this controller.
		cl = this.ctrllist.head;
			
		while(cl != null){
			obj = cl.ob;
			if( obj != this){		// do not draw us...
				obj.Draw();
			}	
			cl = cl.next;
		}
		if( this.orientation != 0){
			ctx.rotate(this.orientation*this.deg* -90);
		}
	}

	// scenecontroller.hittest
	this.HitTest = function(x, y)
	{	var res = null;
		var cl = this.ctrllist.head;
		var i;
		var tx = x-this.l;
		var ty = y-this.t;
		var th = this.h;
		var tw = this.w;

		if( this.orientation == 1){
			tx = y-this.t;			// ty
			ty = -(x-this.l);		// -tx
			th = tw;
			tw = this.h;
		}else if( this.orientation == 2){
			tx = -(x-this.l);		// -tx
			ty = -(y-this.t);		// ty
		}else if( this.orientation == 3){
			tx = -(y-this.t);		// -ty
			ty = (x-this.l);		// tx
			th = tw;
			tw = this.h;
		}


		while(cl != null){
			if( cl.ob != this){
				res = cl.ob.HitTest(tx, ty);
				if( res != null){
					return res;
				}
			}
			cl = cl.next;
		}
		
	xdebugmsg2 = "Hit "+x+" "+y+" "+tx+" "+ty+" "+tw+" "+th;
		if( tx >= 0&& tx <= tw &&
		    ty >= 0 && ty <= th){
			res = this;
		}
		return res;
	}

	// scenecontroller.loadcontrols
	// parse the layout data
	//
	this.loadcontrols = function( )
	{	var obj="";
		var ol = null;
		var tmp;
		var data = this.layout;
		var idx = 0;
		var ob;

		while( data[idx] != ""){
			obj = data[idx];

			// find the object
			ol = object_list.head;
			while( ol != null){
				ob = ol.ob;
				if( ol.ob.istype( obj) ){
					tmp = ol.ob.create( this);
					this.ctrllist.addobj( tmp, null);
					tmp.parent = this;
					tmp.scene = this.scene;		// the scene object
					tmp.load( data, idx);
	
					ol = null;
				}else {
					ol = ol.next;
				}
			}

			idx = data[idx+1]+idx+2;
		}
		this.ctrllist.reverse();

		// do post load stuff such as coord adjust for relative.
		this.postloadcontrols();
	}

	// scenecontroller.postloadcontrols
	// adjust relative coords
	//
	this.postloadcontrols = function()
	{	var cl;
		var obj;

			cl = this.ctrllist.head;
			
			while(cl != null){
				obj = cl.ob;
				if( this.scale == "relative"){
					if( obj != this){
//						obj.l = Math.floor(obj.l * this.w) + this.l;
//						obj.t = Math.floor(obj.t * this.h) + this.t;
						obj.l = Math.floor(obj.l * this.w);
						obj.t = Math.floor(obj.t * this.h);
						obj.w = Math.floor(obj.w * this.w);
						obj.h = Math.floor(obj.h * this.h);
					}	
//				}else if(this.scale == "object"){
//					obj.l += this.l;
//					obj.t += this.t;
				}
				obj.setcoords(obj.l, obj.t, obj.w, obj.h);
				cl = cl.next;
			}
	}

	// scenecontroller.setctx
	//
	this.setctx = function(ctx)
	{	var cl = this.ctrllist.head;

		this.ctx = ctx;

		while(cl != null){
			if( cl.ob != this){
				cl.ob.setctx(ctx);
			}

			cl = cl.next;
		}
	}

	// scenecontroller.parsetarget
	// target is of form scene#scenecontroller#target
	// if scene is missing then search all scenes
	// if scenecontroller is missing search all scenecontrollers in all or specified scene for target
	// xyz	- target xyz in this scenecontroller in current scene
	// abc#xyz - target xyz in scenecontroller abc in current scene
	// abc#def#xyz - target xyz in scenecontroller def in scene abc
	// #xyz - target xyz in all scenecontrollers in this scene
	// abc##xyz

	this.parsetarget = function(t)
	{	var idx, idx2;
		var len = t.length;
		var s = "";
		var tt="";
		var scene = this.scene;
		var controller = this;
		var cnt = 0;
		var parts = [ null, null, null];

		idx2 = 0;
		for(idx = 0; idx < len; idx++){
			if( t.charAt(idx) == "#"){
				s = t.substr(idx2, idx-idx2);
				parts[cnt] = s;
				idx2 = idx+1;
				cnt++;
				if( cnt == 3){
					cnt = 2;
				}
			}
		}
		parts[cnt] = t.substr(idx2, idx-idx2);
		if( cnt == 0){
			return [t, controller, scene ];
		}
		if( cnt == 1){
			return [parts[1], scene.findcontroller(parts[0]), scene ];
		}
		scene = findscenebyname(parts[0]);
		if( scene == null){
			return [ parts[2], null, null ];
		}
		return [ parts[2], scene.findcontroller(parts[1]), scene ];
	}

	this.parseconnectarg = function(t)
	{	var arg, val;
		var idx, idx2;
		var len = t.length;
	
		for(idx = 0; idx < len; idx++){
			if( t.charAt(idx) == "@"){
				return [ t.substr(0, idx), t.substr(idx+1, len - idx -1) ]; 
			}
		}
		return [ "", t ];	// not sure what to do here....
	}

	// scenecontroller.postload
	// post load
	//
	this.postload = function()
	{
		this.linktargets();

	}

	// match the linkto with the targets
	//
	this.linktargets = function()
	{	var tmp,tmp1,tmp2;
		var cnt = 0;
		var scene = null;
		var target="";
		var sl;
		var res;
		var ctrllr;

		tmp = this.ctrllist.head;
		while(tmp != null){
			if( tmp.ob.name == ""){
				tmp.ob.name = "#"+cnt;
				cnt = cnt+1;
			}	
			if( tmp.ob.linklist != null){
				ll = tmp.ob.linklist.head;
				while(ll != null){
					ll.ob.linkit( this );		// this does most of the work.

					ll = ll.next;
				}
			}
			tmp = tmp.next;
		}

	}

	// scenecontroller level
	//
	this.localpostload = function()
	{	var tmp;

		// init the linked values
		tmp = this.ctrllist.head;
		while(tmp != null){
			tmp.ob.sendinitvalue();	// send the initial value.
			tmp = tmp.next;
		}
	}

	// used as part of the layout loader.
	this.findtarget_notused = function(obj)
	{	var cl = this.ctrllist.head;

		while( cl != null){
			if( cl.ob == obj){
				return cl.ob.target;
			}
			cl = cl.next;
		}
		return "NOTFOUND";
	}

	
//	scenecontroller.timer
	this.timer = function()
	{	let cl = null;
		let cln = null;

		cl  = this.ctrllist.head;
		while( cl != null){
			cln = cl.next;
			if( cl.ob.timer( cl.data) ){
				this.ctrllist.removeobj( cl);
			}
			cl = cln;
		}

		this.slowtimer++;
		if( this.slowtimer == 20){
			this.slowtimer = 0;
			this.findpos();
		}
		return false;
	}


	// scenecontroller.KeyPress
	this.KeyPress = function( code, dwn)
	{
		if( dwn == 1){
			this.dosetvalue("keycode-down", code);
		}else {
			this.dosetvalue("keycode-up", code);
		}
	}

	//////////////////////////////////////////////////////////////////////////

	this.mousedown = function(x, y)
	{
	xdebugmsg = "Controller mouse down";
	}

	//////////////////////////////////////////////////////////////////////////


	// build a new string that has the layout info from the ctrllist.head
	//
	this.getlayout = function()
	{	var cl = this.ctrllist.head;
		var msg = "";
		var attrs;

		while(cl != null){
			msg += cl.ob.save();

			cl = cl.next;
		}
		return msg;
	}

	// scene.getpatch
	this.getpatch = function(patchname)
	{	var cl = this.ctrllist.head;
		var msg = "\"patch\", \""+patchname+"\", 0, 0, 0, \n";
		var attrs;

		while(cl != null){
			msg += cl.ob.savepatch( );

			cl = cl.next;
		}
		return msg;
	}

	// find and remove a label by its name.
	// scene
	this.removebyname = function( name)
	{	let cl = this.ctrllist.head;
		let ob = null;

		while(cl != null){
			if( cl.ob.name == name){
				// found it.
				ob = cl.ob;
				this.ctrllist.removeobj( cl);
				return ob;
			}
			cl = cl.next;
		}
		return null;
	}

	this.dump = function()
	{	var msg = "<div class='box'>Controller "+this.name+"("+this.scale+","+this.imagesize+","+this.l+","+this.t+","+this.w+","+this.h+") \n";
		var cl = this.ctrllist.head;

		msg += this.dumpobj();

		msg+= "<p>ctrllist </p>\n";
		while(cl != null){
			if( cl.ob != this){
				msg += "<div>\n";
				if( cl.ob.type == 2 ){
					if( cl.ob != this){
						msg += cl.ob.dump();
					}
				}else {
					msg += cl.ob.dumpobj();
				}
				msg += "</div>\n";
			}
			cl = cl.next;
		}
		msg += "</div>\n";
		return msg;
	}

	this.delobjects = function()
	{	var ob;

		while( this.snaplist.head != null){
			ob = this.snaplist.head;
			this.snaplist.removeobj(this.snaplist.head);
		}
		while( this.ctrllist.head != null){
			ob = this.ctrllist.head;
			this.ctrllist.removeobj(this.ctrllist.head);
		}
	}
}

//////
// support for multiple linkto attributes
// this holds the info for a linkto attribute

function linkfilter( val)
{	this.linkedlist = new objlist();
	this.linkpat= val;	// the filter pattern
	this.linkarg="";
	this.scene = null;
	this.controller = null;

	this.linkit = function( ctrl)
	{	var target;
		var res;
		var scene;
		var ctrllr;
		var tmp1, tmp2;
		var sl;

		target = this.linkpat;	// what we want to link to.
		res =  ctrl.parsetarget( target);
		scene = res[2];
		ctrllr= res[1];
		target= res[0];

		if( scene == null){
			// use all scenes
			sl = scene_list.head;
			while( sl != null){
				scene = sl.ob.controllerlist.head;

				// find the target. find all matching targets
				tmp1 = scene.ob.ctrllist.head;
				while( tmp1 != null){
					if( ctrl.scene.targetmatch(tmp1.ob.target, target) ){
						this.linkedlist.addobj(tmp1.ob, null);
						this.scene = scene;
					}
					tmp1 = tmp1.next;
				}
				sl = sl.next;
			}
		}else {
			if( ctrllr != null){
				tmp2 = ctrllr.ctrllist.head;
				while(tmp2 != null){
					if( ctrl.scene.targetmatch(tmp2.ob.target, target) ){
						this.linkedlist.addobj(tmp2.ob, null);
						this.scene = scene;
						this.controller = ctrllr;
					}
					tmp2 = tmp2.next;		// find all matching targets on this scene#controller.
				}
			}else {
				// find the target. find all matching targets in this scene.
				tmp1 = scene.controllerlist.head;
				while( tmp1 != null){
					tmp2 = tmp1.ob.ctrllist.head;
					while(tmp2 != null){
						if( ctrl.scene.targetmatch(tmp2.ob.target, target) ){
							this.linkedlist.addobj(tmp2.ob, null);
							this.scene = scene;
							this.controller = tmp1.ob;		// tmp1 is the controller.
						}
						tmp2 = tmp2.next;
					}
					tmp1 = tmp1.next;
				}
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////

var keymap = [
	[ "q", 81 ],
	[ "2", 50 ],
	[ "w", 87 ],
	[ "3", 51 ],
	[ "e", 69 ],
	[ "r", 82 ],
	[ "5", 53 ],
	[ "t", 84 ],
	[ "6", 54 ],
	[ "y", 89 ],
	[ "7", 55 ],
	[ "u", 85 ],
	[ "i", 73 ],
	[ "9", 57 ],
	[ "o", 79 ],
	[ "0", 48 ],
	[ "p", 80 ],


	[ "", 0 ]
];


/////////////////////////////////////////////////////////////////
// keyboard object is an instance of scenecontroller()
// has keyboard specific scene functions.
// see sceneobj() for object interface to keyboard.
// 
keyboard.prototype = Object.create( scenecontroller.prototype);

function keyboard(layout, name)
{
	scenecontroller.call( this, layout, name);
	this.bend = 0;		// pitch bend or glissando?


	// scene save
	// this function saves a layout file with .moog extension
	//
	this.save = function()
	{	var msg = "";
		var f = document.getElementById(this.scenename+"_savediv");
		var ff = document.getElementById(this.scenename+"_saveform");

		if( f == null ){
			
			msg = this.getpatch();

			ff = document.getElementById(this.scenename+"_savetext");
			if( ff != null){
				if( ff.style.display == "none")
				{
					ff.style.display="block";

					ff.value = msg;
				}else {
					ff.style.display="none";
				}
			}else {
				alert(msg);
			}
			return;
		}

		if( f.style.display == "none"){

			if( ff != null){
				msg = this.getpatch();
				f.style.display = "block";
				ff.name.value = "patch";
				ff.name.focus();
				ff.data.value = msg;
				ff.action.value="Save Patch";
				ff = document.getElementById(this.scenename+"_savetext");
				if( ff != null){
					ff.style.display="none";
				}
			}
		}else {
			this.restoreobj();		// put back the removed objects
			f.style.display = "none";
		}
	}

	// keyboard save as an html page
	//
	this.saveaspage = function()
	{	var cl = this.ctrllist.head;
		var msg = "";
		var attrs;
		var f = document.getElementById(this.scenename+"_saveform");
		var d = document.getElementById(this.scenename+"_savediv");
		var sn = document.getElementById(this.scenename+"_savenotes");
		var saveaslabel = null;
		var loadlabel = null;


		if( d == null ){
			return;
		}

		if( d.style.display == "none"){
			// remove the SaveAsPage and Load labels..

			saveaslabel = this.removebyname("SaveAsPage");
			loadlabel = this.removebyname("Load");
			
			msg = this.getlayout();

			if( saveaslabel != null){
				this.removelist.addobj(saveaslabel, null);
			}
			if( loadlabel != null)
			{
				this.removelist.addobj(loadlabel, null);
			}
			if( f != null){
				d.style.display = "block";
				sn.style.display = "block";
				sn.innerHTML = "<p>Remember to save the page in a folder that already has the folder images with the two files werkstatt.png and werkstattr.png.";
				sn.innerHTML += "If needed, use the zip below to download them.</p>\n";
				f.name.value = "patch";
				f.data.value = msg;
				f.action.value="saveaspage";
				f.name.focus();
			}else {
				f = document.getElementById(this.scenename+"_savetext");
				if( f != null){
					d.style.display = "block";
					f.value = msg;
				}else {
					alert(msg);
				}
			}
		}else {
			this.restoreobj();		// put back the removed objects

			d.style.display = "none";
			sn.style.display = "none";
		}
	}

	// put back any temp removed controls
	this.restoreobj = function()
	{	var cl; 

		cl = this.removelist.head;
		while( cl != null)
		{	
			this.removelist.removeobj(cl);
			this.ctrllist.addobj(cl.ob, null);

			cl = this.removelist.head;
		}
	}

	// keyboard.savelocal
	this.savelocal = function()
	{	var msg = "";
		var cnt = 0;
		var src,src2;

		if( this.bgimage != null){
			src = this.bgimage.src;
			src2 = src.replace("http://moddersandrockers.com/littlebits/midi/werkstatt/", "");
			msg += '"bgimage", "'+src2+'", ';
			cnt += 2;
		}
		if( this.scale == "relative"){
			msg += '"scale", "relative", ';
			cnt += 2;
		}
		if( this.imagesize != 800){
			msg += '"imagesize", this.imagesize, ';
			cnt += 2;
		}

		return [ cnt, msg ];
	}

	// display the load layout form if hidden else hide it.
	//
	this.loadlayout = function()
	{	var f = document.getElementById(this.scenename+"_loaddiv");
		var ff= document.getElementById(this.scenename+"_loadform");

		if( f == null){
			return;
		}
		if( f.style.display == "none"){
			if( ff == null){
				return;
			}
			f.style.display="block";
			ff.layout.focus();
		}else {
			f.style.display="none";
		}
//		xdebugmsg = "Load layout";
	}

	//////////////////////////////////////////////
	// click is like select..
	// used to 'focus' a control.
	//
	this.unclicked = function()
	{
		if( this.lastclicked != null){
			this.lastclicked.unclick();
		}
		this.lastclicked = null;
	}
}


///////////////////////////////////////////////

function UIloadcancel(scenename)
{	var kbd = findscenebyname(scenename);

	kbd.loadlayout();
}

function UIsavecancel(scenename)
{	var f = document.getElementById(scenename+"_savediv");
	var ff = document.getElementById(scenename+"_savenotes");
	var kbd = findscenebyname(scenename);

	if( ff != null){
		ff.style.display = "none";
	}
	if( f != null){
		f.style.display = "none";
	}
	kbd.restoreobj();		// put back the removed objects

}

// save layout data
// update the patchname label if it is there.
//

function UIsubmitsave(scene)
{		var ff = document.getElementById(scene+"_saveform");
		var f = document.getElementById(scene+"_savediv");
		var sn = document.getElementById(scene+"_savenotes");
		var patchname="";
		var l;
		var msg = "";
		var kbd = findscenebyname(scene);
		var cl = kbd.ctrllist.head;
		var cn;

		if( sn != null){
			sn.style.display = "none";
		}

		patchname = ff.name.value;

		while(cl != null){
			if( cl.ob.target == "patchname"){
				cl.ob.name = patchname;
				cl.ob.Draw();
				cl = null;
			}else {
				cl = cl.next;
			}
		}

		msg = kbd.getpatch(patchname);

		kbd.restoreobj();

		f.style.display = "none";

		ff.data.value = msg;
		ff.submit();
}

///////////////////////////////////////////////////////////////////////////////////
////////////  Piano control
///////////////////////////////////////////////////////////////////////////////////


var pianomap = [
	48, "q", 5, 55,		// Q
	49, "2", 15, 0,		// 2
	50, "w", 25, 55,	// W
	51, "3", 35, 0,		// 3
	52, "e", 45, 55,	// E
	53, "r", 65, 55,	// R
	54, "5", 75, 0,		// 5
	55, "t", 85, 55,	// T
	56, "6", 95, 0,		// 6
	57, "y", 105, 55,	// Y
	58, "7", 115, 0,	// 7
	59, "u", 125, 55,	// U
	60, "i", 145, 55,	// I
	61, "9", 155, 0,	// 9
	62, "o", 165, 55,	// O
	63, "0", 175, 0,	// 0
	64, "p", 185, 55,	// P

	0, 0, 0, 0
];


object_list.addobj( new objfactory("piano", pianoobj) );

pianoobj.prototype = Object.create(sceneObject.prototype);

function pressedkey(note)
{	this.note = note;
}

function pianoobj(parent)
{
	sceneObject.call(this, parent);
	this.nnotes = 15;		// number of white notes...
	this.nwidth = 0;
	this.markw = 0;
	this.markh = 0;
	this.blktab = [ 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0 ];
	this.shifttab = [ 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6 ];
	this.state = 0;
	this.parent = parent;
	this.nwidth2 = 0;
	this.nwidth34= 0;
	this.lastnote=0;
	this.dx = 0;
	this.dy = 0;
	this.keylist = new objlist();
	this.curkey = 0;
	this.bend = 0;
	this.octave = 48;
	this.sendchan = 0;	
	this.typename = "piano";

	this.setcoords = function(x, y, w, h)
	{
		this.r = x + w;
		this.b = y + h;
		this.w2 = Math.floor(w/2);
		this.h2 = Math.floor(h/2);

		this.nwidth = Math.floor((this.r-this.l - 20) / this.nnotes);
		this.markw = Math.floor( this.nwidth/3 );
		this.markh = Math.floor( (this.h)/8 );
		this.nwidth2 = Math.floor(this.nwidth/2);
		this.nwidth34= Math.floor( 3*this.nwidth/4);
		this.r = x + this.nnotes * this.nwidth+2;
	}

	this.DrawNote = function(note, on )
	{	var i;
		var x;
		var blk,bh;
		var n, o;

//		xdebugmsg = "note="+note+" nnotes="+this.nnotes+" markw="+this.markw+" markh="+this.markh;

		if( note < 48 || note > 48+ Math.floor( this.nnotes / 7)*12){
			return;
		}

		this.ctx.save();

		note -= 48;

		n = note % 12;
		o =  ( Math.floor(note / 12) );
		blk = this.nwidth34;

		x = this.l + (this.shifttab[n] + o * 7 ) * this.nwidth - Math.floor(this.markw/2);
		if( this.blktab[n] == 1){
			bh = Math.floor( (this.b-this.t)/2);
			x += this.nwidth;
		}else {
			bh = 5 * Math.floor( (this.b-this.t)/6);
			x += this.nwidth2;
		}

		if( on == 1){
	        this.ctx.fillStyle = "#0000ff";
		}else {
			if( this.blktab[n] == 1){
		        this.ctx.fillStyle = "#000000";
			}else {
		        this.ctx.fillStyle = "#ffffff";
			}
		}

		bh += this.t;
        this.ctx.fillRect( x ,  bh, this.markw, this.markh);
		this.ctx.restore();
	}

	this.Draw = function( )
	{	var i,j;
		var x;
		var blk,bh;

		this.ctx.save();

		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(this.l, this.t, this.r-this.l, this.b-this.t);

		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(this.l, this.t, this.nnotes*this.nwidth, this.b-this.t);

		x = this.l;
		for(i=0; i < this.nnotes; i++){
			this.ctx.strokeRect(x, this.t, this.nwidth, this.b-this.t);
			x += this.nwidth;
		}

		x = this.l;
		blk = this.nwidth34;
		bh = Math.floor(2*(this.b-this.t)/3);
		this.ctx.fillStyle = "#000000";
		for(i=0; i < this.nnotes-1; i++){
			j = i % 7;
			if( j != 2 && j != 6 ){
				this.ctx.fillRect(x+blk, this.t, this.nwidth/2, bh);
			}
			x += this.nwidth;
		}

		this.ctx.restore();
	}

	// calculate the note number
	//
	this.findkey = function(x, y)
	{	var ret = 0, bret;
		var nx = x-this.l;
		var ny = y - this.t;
		var k, k7, bk, bk7;
		var b;
		var blk;
		var bh;
		var bl;
		var wnotemap = [ 0, 2, 4, 5, 7, 9, 11, 12];
		var bnotemap = [ 1, 3, 0, 6, 8, 10, 0, 13];

		blk = this.nwidth34;
		bh = Math.floor(2*(this.b-this.t)/3);

		k = Math.floor(nx / this.nwidth);
		k7 = Math.floor(k / 7);
		ret = wnotemap[ k % 7] + k7*12 + this.octave; // default value

		if( ny < bh){	// could be a black key
			nx = nx - this.nwidth34;
			if( nx < 0){
				nx = 0;
			}
			bk = Math.floor(nx / this.nwidth);
			bl = Math.floor(bk*this.nwidth);
//			xdebugmsg = "bl="+bl+" nx="+nx+" r="+(bl+this.nwidth2)+" k="+bk;
			if( nx > bl && nx < (bl+this.nwidth2) ){
				bk7 = Math.floor(bk / 7);
				bret = bnotemap[ bk % 7];
				if( bret != 0){
					ret = bret + this.octave + bk7*12;
				}
			}
		}

		return ret;
	}

	this.mouseUp = function( x, y)
	{	var k = this.findkey(x, y);

		this.noteOff( this.lastnote, 127, this.sendchan);

	}

	this.mouseMove = function(x, y)
	{	var tmp;

		if( this.HitTest( x, y) == this ){
			tmp = this.findkey(x, y);

			if( this.bend == 0){
				if( this.lastnote != tmp){
					this.noteOff( this.lastnote, 127, this.sendchan);

					this.noteOn(tmp, 127, this.sendchan);
					this.lastnote = tmp;
				}
			}
		}
	}

	this.mouseDown = function(x, y)
	{	var k = this.findkey(x, y);
		this.sx = x;
		this.sy = y;

		this.noteOn( k, 127, this.sendchan);
		this.lastnote = k;
	}

	// pianoobj.keypress
	// code is the letter qwertyuiop etc
	this.KeyPress = function( code, dwn)
	{	var i;
		var val;
		var k = 0;

		if( code == this.curkey && dwn == 1){
			return;
		}

//		xdebugmsg ="piano KeyPress "+code+" "+dwn;
		for(i=0; pianomap[i] != 0 ; i += 4){
			if( pianomap[i+1] == code){
				val = pianomap[i];
				if( dwn == 1){
					this.curkey = code;
					this.noteOn(val, 127, this.sendchan);
				}else {
					this.noteOff(val, 127, this.sendchan);
					this.curkey = 0;
				}
				return;
			}
		}
//		xdebugmsg ="not found KeyPress "+code+" "+up;
	}

	this.noteOn = function( note, vel, chan)
	{	var msg3 = [ 0x90, 0, 0];
		

		msg3[0] = 0x90 | (chan & 0x0f);
		msg3[1] = note;
		msg3[2] = vel;

		this.DrawNote( note, 1);

		xdebugmsg = "ON "+msg3[0]+" "+msg3[1]+" "+msg3[2]+" SC="+this.sendchan;

		this.dosetvalues( "key-on", chan, msg3 );

	}

	this.noteOff = function( note, vel, chan)
	{	var msg3 = [ 0x80, 0, 0];
	
		msg3[0] = 0x80 | (chan & 0x0f);
	    msg3[1] = note;
		msg3[2] = vel;

		this.DrawNote( note, 0);

		this.dosetvalues( "key-off", chan, msg3 );

	}


	this.doSave = function()
	{	var msg = "1,";

		return msg;
	}

		
	this.setvalue = function(arg, val)
	{
		if( arg == "bend"){
			this.bend = val;
		}else if( arg == "keycode-down" ){
			this.KeyPress(val, 1);
		}else if( arg == "keycode-up"){
			this.KeyPress(val, 0);
		}

	}

	this.loadlocal = function(name, val)
	{
		if( name == "chan"){
			this.sendchan = val;
		}
	}

	this.setvalues = function(arg, chan, val)
	{	
		xdebugmsg2 = "piano setvalues "+arg;
		if( arg == "key-on")
		{
			this.noteOn( val[1], val[2], val[0] & 0xf);
		}else if( arg == "key-off")
		{
			this.noteOff( val[1], val[2], val[0] & 0xf);
		}else if( arg == "programchange"){
			this.dosetvalues( arg, chan, val );
		}
	}

	this.save = function()
	{	var attrs = this.saveattrs();
		var lattrs= this.savelocal();
		return '"piano", '+this.savepos()+(attrs[0]+lattrs[0])+", "+attrs[1]+lattrs[1]+"\n";
	}
}

////////////////////////////////////////////////////////
//
// labeled indicator
//
object_list.addobj( new objfactory("button", buttonobj) );

buttonobj.prototype = Object.create(sceneObject.prototype);

function buttonobj( parent)
{	sceneObject.call(this, parent );
	this.w2 = Math.floor(this.w/2);
	this.h2 = Math.floor(this.h/2);

	this.color = "#ff0000";

	this.Draw = function()
	{
		this.ctx.save();

		// draw indicator
//		xdebugmsg2 = "l="+this.l+" r="+this.r+" t="+this.t+" b="+this.b;

		this.ctx.fillStyle = this.color;
		if( this.style == 0){
			if( this.val == 0){
				this.ctx.fillStyle = "#000000";
			}
			this.ctx.fillRect( this.l+ this.w2, this.t+ this.h2, 10, 10);
		}else if( this.style == 1){
			this.ctx.fillStyle = this.bgcolor;
			this.ctx.fillRect( this.l,this.t, this.w, this.h);

			if( this.val == 0){
				this.ctx.fillStyle = this.color;
				this.ctx.fillRect( this.l,this.t+this.h2, this.w, this.h2);
			}else {
				this.ctx.fillStyle = this.color;
				this.ctx.fillRect( this.l,this.t, this.w, this.h2);
			}
		}

		this.ctx.restore();
	}

	this.mouseDown = function(mx, my)
	{
		if( this.val == 0){
			this.val = 1;
		}else {
			this.val = 0;
		}
//		xdebugmsg2 = "button link "+this.linkedarg+" "+this.val;

		this.dosetvalue(null, this.val);
		this.Draw();
	}

	this.mouseMove = function(x, y)
	{
//		xdebugmsg2 = "button move";
	}

	this.save = function()
	{	var attrs = this.saveattrs();
		var lattrs= this.savelocal();
		return '"button", '+this.savepos()+(attrs[0]+lattrs[0])+", "+attrs[1]+lattrs[1]+"\n";
	}

	this.sendinitvalue = function()
	{
		this.dosetvalue(null, this.val);
	}
}

/////////////////////////////////////////////////////////
///
/// 
object_list.addobj( new objfactory("rotary", rotaryobj) );
rotaryobj.prototype = Object.create(sceneObject.prototype);

function rotaryobj(parent)
{
	sceneObject.call(this, parent);

	this.w2 = 0;
	this.h2 = 0;

	this.plen = 0;	// pointer length
	this.cx = 0;	// center x
	this.cy = 0;
	this.deg = Math.PI/180;

	this.setcoords = function(x, y, w, h)
	{
		this.r = x + w;
		this.b = y + h;
		this.w2 = Math.floor(w/2);
		this.h2 = Math.floor(h/2);

		this.plen = Math.floor( (this.r-this.l) /3);	// pointer length
		this.cx = this.l+ this.w2;	// center x
		this.cy = this.t+ this.h2;
	}

	this.Draw = function()
	{	var v = Math.floor(this.val/256);
		this.cx = this.l+ this.w2;	// center x
		this.cy = this.t+ this.h2;
	
		this.ctx.save();
//		this.ctx.translate( this.parent.l, this.parent.t);

		if( this.style==1){

			this.ctx.fillStyle = "#000000";

			this.ctx.translate( this.cx, this.cy);
			this.ctx.rotate( (v + 135)*this.deg );

			this.ctx.beginPath();
			this.ctx.arc(0,0,this.plen,0,2*Math.PI)
			this.ctx.fill();

		}else {
			this.ctx.fillStyle = this.bgcolor;
			this.ctx.fillRect(0, 0, this.w, this.h);
			// xdebugmsg2 = "Rotary draw "+this.l+" "+this.r+" "+this.w+" "+this.h;

			if( this.bordercolor != ""){
				this.ctx.strokeStyle = this.bordercolor;
				this.ctx.lineWidth = 2;

				this.ctx.strokeRect(0, 0, this.r-this.l, this.b-this.t);
			}

			// draw indicator

			this.ctx.fillStyle = this.color;

			this.ctx.translate( this.cx, this.cy);
			this.ctx.rotate( (v + 135)*this.deg );

			this.ctx.fillRect( -2, -2, 4, 4);
		}

		this.ctx.fillStyle = this.color;
		this.ctx.fillRect( 0, 0, this.plen, 2);

		this.ctx.restore();

	}

	this.setvalues = function( linkarg, chan, val)
	{
		this.setvalue(linkarg, val[2]*512);
	}

	this.save = function()
	{	var attrs = this.saveattrs();
		var lattrs= this.savelocal();
		return '"rotary", '+this.savepos()+(attrs[0]+lattrs[0])+", "+attrs[1]+lattrs[1]+"\n";
	}

	this.sendinitvalue = function()
	{
		// alert("rotary sendinitvalue");
		this.dosetvalue(null, this.val);
	}
}

/////////////////////////////////////////////////////////
object_list.addobj( new objfactory("slider", sliderobj) );

sliderobj.prototype = Object.create(sceneObject.prototype);

function sliderobj(parent)
{
	sceneObject.call(this, parent);
	this.kh = 0;
	this.kh2 = 0;
	this.kw = 0;
	this.kw2 = 0;
	this.range = 0;
	this.step = 0;

	this.setcoords = function(x, y, w, h)
	{
		this.r = x + w;
		this.b = y + h;
		this.w2 = Math.floor(w/2);
		this.h2 = Math.floor(h/2);

		this.kh = Math.floor(h/10);
		this.kh2 = Math.floor( this.kh/2);
		this.kw = Math.floor( (3*(w))/4);
		this.kw2 = Math.floor( this.kw/2);
		this.range = h - 20 - this.kh;
		this.step = (this.range /256);
	}

	this.Draw = function()
	{	var v = Math.floor(this.val/256);

		this.ctx.save();

		if( this.bgcolor != ""){
			this.ctx.fillStyle = this.bgcolor;
			this.ctx.fillRect(this.l, this.t, this.r-this.l, this.b-this.t);
		}

		if( this.bordercolor != ""){
			this.ctx.strokeStyle = this.bordercolor;
			this.ctx.lineWidth = 2;
			this.ctx.strokeRect(this.l, this.t, this.r-this.l, this.b-this.t);
		}

		// draw indicator
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(this.l+this.w2-2, this.t+this.kh2, 4, this.range+this.kh);

		this.ctx.fillStyle = this.color;
		this.ctx.fillRect( this.l+this.w2-this.kw2, this.t+Math.floor((256- v )*this.step)+this.kh2,  this.kw, this.kh);

		this.ctx.restore();

	}

	this.save = function()
	{	var attrs = this.saveattrs();
		var lattrs= this.savelocal();
		return '"slider", '+this.savepos()+(attrs[0]+lattrs[0])+", "+attrs[1]+lattrs[1]+"\n";
	}

	this.sendinitvalue = function()
	{
		this.dosetvalue(null, this.val);
	}
}

/////////////////////////////////////////////////////////

object_list.addobj( new objfactory("label", labelobj) );

labelobj.prototype = Object.create(sceneObject.prototype);

function labelobj(parent)
{	sceneObject.call(this, parent);

	this.kh = 0;
	this.kh2 = 0;
	this.kw = 0;
	this.kw2 = 0;
	this.range = 0;
	this.step = 0;
	this.w2 = 0;
	this.h2 = 0;
	this.tangle = 0;
	this.action = "";

	this.setcoords = function(x, y, w, h)
	{
		this.r = x + w;
		this.b = y + h;
		this.w2 = Math.floor(w/2);
		this.h2 = Math.floor(h/2);

		this.kh = Math.floor(h/10);
		this.kh2 = Math.floor( this.kh/2);
		this.kw = Math.floor( (3*(w))/4);
		this.kw2 = Math.floor( this.kw/2);
		this.range = h - 20 - this.kh;
		this.step = (this.range /256);
	}

	this.Draw = function()
	{	var v = Math.floor(this.val/256);
		var tx, ty;
		

		this.ctx.save();

		tx = this.l;
		ty = this.t+ this.h2;
		this.ctx.translate( tx, ty);

		if( this.tangle != 0){
			this.ctx.rotate( this.tangle * this.deg);
		}

		if( this.bgcolor != ""){
			this.ctx.fillStyle = this.bgcolor;
			this.ctx.fillRect(0, 0, this.w, this.h);
		}
		if( this.bgimage != null){
			this.ctx.drawImage(this.bgimage, this.l, this.t, this.w, this.h);
		}


		this.ctx.fillStyle = this.color;
		this.ctx.fillText(this.label, 5, 15 );

		if( this.bordercolor != ""){
			this.ctx.strokeStyle = this.bordercolor;
			this.ctx.lineWidth = 2;
			this.ctx.strokeRect(0, 0, this.w, this.h);
		}

		this.ctx.restore();

	}

	this.mouseDown = function(x, y)
	{
		this.val = 1;
		this.dosetvalue(null, this.val);
	}

	this.angle = function(a)
	{
		this.tangle = a;
	}
	
	this.loadlocal = function(name, val)
	{
		if( name == "angle"){
			this.tangle = val;
		}
		if( name == "action"){
			this.action = val;
		}
	}

	this.savelocal = function()
	{	var msg = "";
		var cnt = 0;

		if( this.tangle != 0){
			msg += '"angle", '+this.tangle+', ';
			cnt += 2;
		}
		if( this.action != 0){
			msg += '"action", "'+this.action+'", ';
			cnt += 2;
		}

		return [cnt, msg];
		
	}

	this.save = function()
	{	var attrs = this.saveattrs();
		var lattrs= this.savelocal();
		return '"label", '+this.savepos()+(attrs[0]+lattrs[0])+", "+attrs[1]+lattrs[1]+"\n";
	}


	this.setvalue = function(arg, val)
	{
		if( arg == "label"){
			this.label = val;
			this.Draw();
		}
	}

}

////////////////////////////////////////////////////////
object_list.addobj( new objfactory("selector", selector) );
selector.prototype = Object.create(sceneObject.prototype);

function selector(parent)
{	sceneObject.call(this, parent);
	this.chans = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	this.w16 = Math.floor(this.w/16);


	this.Draw = function()
	{	var i;
	var h2 = Math.floor(this.h/2);

		this.ctx.save();
		
		if( this.bgcolor != ""){
			for(i= 0; i < 16; i++){
				this.ctx.fillStyle = this.bgcolor;
				this.ctx.fillRect(this.l+i*this.w16+5, this.t, this.w16-10, this.h);
			}
		}
		for(i= 0; i < 16; i++){
			this.ctx.fillStyle = "black";
			this.ctx.translate(this.l+i*this.w16+5, this.t);
			this.ctx.fillText(""+(i+1), 5, 15 );
			this.ctx.translate(-(this.l+i*this.w16+5), -this.t);
		}
		for(i= 0; i < 16; i++){
			if( this.chans[i] ==0){
				this.ctx.fillStyle = "black";
			}else {
				this.ctx.fillStyle = this.color;
			}
			this.ctx.fillRect( this.l+i*this.w16+10, this.t+h2, 10, 10);
		}

		this.ctx.restore();
	}

	this.mouseDown = function(x, y)
	{	var pos =Math.floor( (x - this.l) / this.w16);

		if( this.chans[pos] != 0){
			this.chans[pos] = 0;
		}else {
			this.chans[pos] = 1;
		}
		this.Draw();
	}

	this.setvalue = function(arg, val)
	{
	}


	this.setvalues = function(arg, chan, val)
	{	var chan;

		if( this.linked != null){
			if( arg == "key-on" || arg == "key-off")
			{
				if( this.chans[ chan ] != 0){
					this.dosetvalues(arg, chan, val);
				}
			}
		}
	}

}

////////////////////////////////////////////////////////
object_list.addobj( new objfactory("indicator", ledobj) );

ledobj.prototype = Object.create(sceneObject.prototype);

function ledobj( parent)
{	sceneObject.call(this, parent  );

	this.Draw = function()
	{	var tval;
		var colors;

		this.ctx.save();

		// draw indicator

		colors = this.getcolors( this.color);

		if( this.style == 0){
			tval = this.val /65536;
			colors[0] = Math.floor( colors[0] * tval);
			colors[1] = Math.floor( colors[1] * tval);
			colors[2] = Math.floor( colors[2] * tval);
			this.ctx.fillStyle = this.makecolor(colors);
			this.ctx.fillRect( this.l, this.t, this.w, this.h);
		}else if( this.style == 1){
			this.ctx.fillStyle = this.bgcolor;
			this.ctx.fillRect( this.l,this.t, this.w, this.h);

			ty = this.val / 65535 * this.h;
			this.ctx.fillStyle = this.color;
			this.ctx.fillRect( this.l,this.t+this.h - ty , this.w, ty);
		}

		this.ctx.restore();
	}

	this.setvalue = function( arg, val)
	{
		this.val = val;
//		xdebugmsg2 = "LED "+val;
		this.Draw();
	}

}

////////////////////////////////////////////////////////
object_list.addobj( new objfactory("lfo", lfoobj) );

lfoobj.prototype = Object.create(sceneObject.prototype);

function lfoobj( parent)
{	sceneObject.call(this, parent);

	this.Draw = function()
	{

	}
}

////////////////////////////////////////////////////////
object_list.addobj( new objfactory("scope", scopeobj) );

scopeobj.prototype = Object.create(sceneObject.prototype);

function scopeobj( parent )
{	sceneObject.call(this, parent );
	this.analyser = null;
	this.buffer = null;
	this.bufferlength = 0;
	this.h2 = Math.floor( h/2);
	this.af = null;
	this.min = 1;

	this.Draw = function()
	{	var idx, n;
		var x,w;
		var v, f, prev;
		var len;

		if( this.buffer == null){
			return;
		}
		this.bufferlength = this.analyser.frequencyBinCount;
		this.analyser.getByteTimeDomainData(this.buffer);

		this.ctx.save();

		this.ctx.fillStyle = this.bgcolor;
		this.ctx.fillRect( this.l, this.t, this.w, this.h);

		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = this.color;
		this.ctx.strokeRect( this.l, this.t, this.w, this.h);

		len = this.bufferlength/ 2;

		w = this.w * 1.0 / (len);
		v = (this.buffer[idx] / 350.0) * this.h+this.t+5;
		x = this.l;

		f = 0;
		prev = this.buffer[0];
		while( prev >= this.buffer[f] && f < this.bufferlength){
			prev = this.buffer[f];
			f += 10;
		}
		while( prev <= this.buffer[f] && f < this.bufferlength){
			prev = this.buffer[f];
			f += 10;
		}

		this.ctx.beginPath();

 		this.ctx.moveTo(x, v);

		n = f;
		for(idx = 0; idx < len; idx++) {
			if( n == this.bufferlength){
				n = 0;
			}
			v = ( (this.buffer[n]-128) / 512.0) * this.h+this.t+this.h2;
			this.ctx.lineTo(x, v);

			x += w;
			n++;
		}

		this.ctx.lineTo(this.r, this.h2);

		this.ctx.stroke();

		this.ctx.restore();

	}

	this.setvalue = function(arg, val)
	{
	}

	this.timer = function()
	{
		this.Draw();
		return true;
	}

	this.sendinitvalue = function()
	{
		if( actx != null){
			this.analyser = actx.createAnalyser();
			this.analyser.fftSize = 2048;
			this.bufferlength = this.analyser.frequencyBinCount;
			this.buffer = new Uint8Array(this.bufferlength);
			this.analyser.getByteTimeDomainData(this.buffer);

			this.min = this.bufferlength;

			// hook up to the source
//			alert("osc send init");
			this.dosetvalue(null, this.analyser);

			animation_list.addobj(this, null);
		}
	}
}

////////////////////////////////////////////////////////
object_list.addobj( new objfactory("setvalue", svobj) );

svobj.prototype = Object.create(sceneObject.prototype);

function svobj( parent )
{	sceneObject.call(this, parent );

	this.Draw = function()
	{

	}

	this.sendinitvalue = function()
	{
		this.dosetvalue(null, this.val);
	}
}

////////////////////////////////////////////////////////
// add object to scene/scenecontroller
// assumes that sco is a bit
//
function addsceneobject( sc, scc, sco)
{	var sl = scene_list.head;
	var cl;
	var scene;
	var sketch;

	while(sl != null){
		if( sl.ob.name == sc){
			scene = sl.ob;
			cl = scene.controllerlist.head;
			while(cl != null){
				if( cl.ob.name == scc){
					sketch = cl.ob;
					sketch.ctrllist.addobj(sco, null);

					sco.scene = scene;
					sco.ctx = scene.ctx;
					sco.parent = cl.ob;		// sketch is parent.
					sketch.addBit( sco);
					return;
				}
				cl = cl.next;
			}
		}
		sl = sl.next;
	}

}


function findsketch( sc, scc)
{	var sl = scene_list.head;
	var cl;
	var scene;
	var sketch;

	while(sl != null){
		if( sl.ob.name == sc){
			scene = sl.ob;
			cl = scene.controllerlist.head;
			while(cl != null){
				if( cl.ob.name == scc){
					sketch = cl.ob;
					return sketch;
				}
				cl = cl.next;
			}
		}
		sl = sl.next;
	}
	return null;
}
