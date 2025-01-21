// 10/19/24
// 1/20/25

function doBitFormAction()
{
    bitform = document.getElementById("bitform");
	if( bitform != null){
		if( bitformaction != null){
			bitformaction.getData();
		}
		bitform.innerHTML = "";
		bitformaction = null;
	}
	showSettings();

	bitform = null;
}

///////////////////////////////////////////////////////////
wireBit.prototype = Object.create(control.prototype);

function wireBit(bit)
{	control.call(this, bit);

	this.bit = bit;
	this.points = [];


// wire
	this.Draw = function( )
	{	const b = this.bit;
		let bt;
		let dx;
		let dy;
		let mx, my;
		let sx,sy;

		if( b == null){
			return;
		}
		if( showsnaps == 0){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#00ff00";

		dx = b.snaps[1].x - b.snaps[0].x;
		dy = b.snaps[1].y - b.snaps[0].y;

		mx = dx / 2;
		my = dy / 2;

		if( bt == 0){
			sx = b.snaps[0].x+15;
			sy = b.snaps[0].y+25;

	        ctx.fillRect(sx,  sy, mx, 5);
			sx += mx;
	        ctx.fillRect(sx-5,  sy, 5, dy);
			sy += dy;
			ctx.fillRect(sx-5,  sy, mx, 5);
		}else {
			sx = b.snaps[0].x+25;
			sy = b.snaps[0].y;

	        ctx.fillRect(sx,  sy, 5, my);
			sy += my;
	        ctx.fillRect(sx,  sy-5, dx, 5);
			sx += dx;
			ctx.fillRect(sx,  sy-5, 5, my);

//	        ctx.fillRect(b.x+(b.w/2)-10,  b.y, 20, my);
		}
        ctx.fillStyle = "#000000";

		// draw input snap
		if( b.snaps[0].side == "-l"){
			drawImage(wirelinimg, b.snaps[0].x, b.snaps[0].y);
		}else {
			drawImage(wiretinimg, b.snaps[0].x, b.snaps[0].y);
		}
		// draw output snap
		if( b.snaps[1].side == "-r"){
			drawImage(wireroutimg, b.snaps[1].x, b.snaps[1].y);
		}else {
			drawImage(wireboutimg, b.snaps[1].x, b.snaps[1].y);
		}
	}

// wire
	this.setBitSize = function(ax, ay)
	{	var l,r,t,b;
		var bit = this.bit;
		
		if( (bit.btype & 1) == 0){
			l = bit.snaps[0].x +15;
			r = bit.snaps[1].x;
			t = bit.y;
			b = bit.y+bit.h;

			bit.x = l;

			bit.w = r-l;
			bit.initw = bit.w;
			
			bit.setOrientation(0);
		}else {
			t = bit.snaps[0].y+15;
			b = bit.snaps[1].y;
			l = bit.x;
			r = bit.x+bit.w;

			bit.y = t;

			bit.h = b - t;
			bit.initw = bit.h
			bit.setOrientation(1);
		}
	}

// wire 
	this.HitTest = function(x, y)
	{	var res = null;

		return res;
	}


	this.setData = function()
	{	let msg="";
		let idx;
		const b = this.bit;

		if( bitform != null){
			bitform.innerHTML="";
		}
		
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg = "<table>";

			msg += "<tr>";
			for(idx = 0; idx < b.snaps.length; idx ++){
				if( b.snaps[idx] != null){
					msg += "<td>"+b.snaps[idx].side+"</td>";
				}else {
					msg += "<td> - </td>";
				}

			}
			msg += "</tr>";
			msg += "<tr>";
			for(idx = 0; idx < b.snaps.length; idx ++){
				if( b.snaps[idx] != null){
					msg += "<td>("+b.snaps[idx].x+","+b.snaps[idx].y+")</td>";
				}else {
					msg += "<td> - </td>";
				}

			}
			msg += "</tr>";
			msg += "<tr>";
			for(idx = 0; idx < b.snaps.length; idx ++){
				if( b.snaps[idx] != null){
					msg += "<td>("+b.snaps[idx].w+","+b.snaps[idx].h+")</td>";
				}else {
					msg += "<td> - </td>";
				}

			}
			msg += "</tr>";
			msg += "<tr>";
			msg += "<td>"+(b.btype & 7)+"</td>";
			msg += "<td>"+(b.code)+"</td>";
			msg += "<td>("+b.x+","+b.y+")</td>";
			msg += "<td>("+b.w+","+b.h+")</td>";
			msg += "</tr>";

			msg += "</table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	
	}




// wire 
	this.doSave = function()
	{	const b = this.bit;
		let s = new saveargs();

		s.addnv("control", "'wire'");
		s.addnv("inx", b.snaps[0].x);
		s.addnv("iny", b.snaps[0].y);
		s.addnv("outx", b.snaps[1].x);
		s.addnv("outy", b.snaps[1].y);

		return s.getargs();
	}
	
	this.doLoad = function(initdata, idx)
	{	let len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";
		const b = this.bit;

		for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
			val = initdata[idx+n+1];

			if( param == "control"){
				continue;
			}
			if( param == "inx"){
				b.snaps[0].x = val;
			}else if( param == "iny"){
				b.snaps[0].y = val;
			}else if( param == "outx"){
				b.snaps[1].x = val;
			}else if( param == "outy"){
				b.snaps[1].y = val;
			}

		}

	}		
		

}

//////////////////////////////////////////////////////////////////
//


function control(bit)
{	this.bit = bit;
	this.l = 0;
	this.r = 0;
	this.t = 0;
	this.b = 0;
	this.sx = 0;
	this.sy = 0;
	this.sval = 0;
	this.audioin = null;
	this.audioout = null;
	this.connected = false;	// audio connected?
	this.background = "#ffffff";
	this.color = "#000000";
	this.font = "10px Georgia";
	this.name = "Control";

	// control
	this.setBounds = function()
	{	var b = this.bit;
		var bt;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		if( bt == 0){
			this.l = b.x+10;
			this.r = b.x+b.initw-10;
			this.t = b.y+10;
			this.b = b.y+b.inith-10;
		}else {
			this.l = b.x+10;
			this.r = b.x+b.inith-10;
			this.t = b.y+10;
			this.b = b.y+b.initw-10;
		}
	}


	this.setOrientation = function(bt)
	{
		return false;
	}


	// control
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

	// control
	this.Draw = function( )
	{	const b = this.bit;
		let bt;
		let xval;
		let p;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		p = this.getDockedBit(0);

		if( p == null){
			xval = 0;
		}else {
			xval = p.data;
		}

		ctx.save();
		if( bt == 0){
	       drawImage(defaultimg , b.x,  b.y);
		}else {
			ctx.translate( b.x, b.y+b.h);
			ctx.rotate(- Math.PI/2);
	        drawImage( defaultimg , b.x,  b.y);
		}
		ctx.restore();
	}

	// control
	this.HitTest = function(x, y)
	{	var res = null;
		var i;
		const b = this.bit;
		var bt;

		if( b == null){
			return;
		}
		if( !b.isDocked()){
			return null;
		}

		bt = b.btype & 7;	// 0 = horiz, 1 == vert
		this.setBounds();
		
		if( x >= this.l && x <= this.r &&
		    y >= this.t && y <= this.b){
			res = this;
		}
		return res;
	}

	// control basic placeholders
	this.setup = function()
	{
		debugmsg("CTRL setup");

	}

// control.getdata
	this.getData = function()
	{
	}

	// setup the bitform.
	this.setData = function()
	{
	}

	// control
	this.onRemove = function()
	{
		
	}

	this.selected = function(x, y)
	{
		if( x == y){
			return " selected ";
		}
		return "";
	}

	// control
	this.onMove = function()
	{
	}


	this.startMove = function()
	{
	}

// control
	this.stopMove = function()
	{
//		var sketch=this.bit.parent;
		selected = this.bit;
		curctrl = null;			// stop tracking
	}

	this.doSave = function()
	{	var msg = "1,";

		return msg;
	}
		
//control
	this.doLoad = function(initdata, idx)
	{	var i = initdata[idx];
	}		
		

	this.delbit = function()
	{
	}

// control
this.dock = function(from, dom)
{	let msg="";
	
	if( dom == 2){
		debugmsg("Connect "+from.name+" to "+this.name+" "+msg+" dom="+dom);
		this.setup();
		from.dockto(this.bit, dom);
	}
}

// control from is a bit
this.undock = function(from)
{	let d = 0;

	if( this.audioin != null ||
		this.audioout != null){
		d = 2;
	}
	from.undockfrom(this.bit, d);
}

// from is bit
this.dockto = function(from, dom)
{
	if( dom == 2){
		this.setup();
	}

	if( from.ctrl != null ){

		if( from.ctrl.audioin != null && this.audioout != null ){
			debugmsg("link "+this.name+" to next module");
			this.audioout.connect( from.ctrl.audioin);
			this.connected = true;
		}else {
			debugmsg("DOCKTO null");
		}
	}
}

// control
this.undockfrom = function(from, dom)
{	let b = from.ctrl;

	if( dom == 2){
		if( b != null){
			if( from.ctrl.audioin != null && this.connected){
				debugmsg("unlink "+this.name+" from next module");
				this.connected = false;
				this.audioout.disconnect( from.ctrl.audioin);
			}
		}
	}
}

	// control
	this.setValue = function(data, chan)
	{

	}

	this.getValue = function(chan)
	{
		return this.bit.value;
	}
	//control

	this.startProg = function()
	{
		debugmsg("Start Programming");
	}

	this.stopProg = function()
	{
		debugmsg("Stop Programming");
	}

	this.keyPress = function(code, up)
	{	let bit = this.bit;
		debugmsg("Keypress "+bit.name+" "+code+" "+up);
	}

}




