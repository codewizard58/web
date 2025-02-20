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

function wireDraw(ctrl)
{
	const b = ctrl.bit;
		let dx;
		let dy;
		let mx, my;
		let sx,sy;
		let sn, sw, sh;
		let osnap;

		if( b == null){
			return;
		}

        ctx.fillStyle = "#00ff00";

		osnap = b.snaps[1];
		if( osnap == null){
			osnap = b.snaps[3];
		}

		dx = osnap.x - b.snaps[0].x;
		dy = osnap.y - b.snaps[0].y;

		mx = dx / 2;
		my = dy / 2;

		if( b.snaps[0].paired){
			sn = b.snaps[0].paired;
			ctx.fillStyle = powerColors[sn.bit.chain];
		}

		if( b.snaps[0].side == "-l"){
			sx = b.snaps[0].x+15;
			sy = b.snaps[0].y+25;

	        ctx.fillRect(sx,  sy, mx, 5);
			sx += mx;
			if( osnap.side == "-r"){
				ctx.fillRect(sx-5,  sy, 5, dy);
				sy += dy;
				ctx.fillRect(sx-5,  sy, mx, 5);
			}else {
				ctx.fillRect(sx,  sy, mx+10, 5);
				sx += mx+10;
				ctx.fillRect(sx-5,  sy, 5, dy-15);
				sy += dy-15;
			}
		}else {		// is -t
			sx = b.snaps[0].x+25;
			sy = b.snaps[0].y+15;

	        ctx.fillRect(sx,  sy, 5, my);
			sy += my;
			if( osnap.side == "-b"){
		        ctx.fillRect(sx,  sy-5, dx, 5);
				sx += dx;
				ctx.fillRect(sx,  sy-5, 5, my);
			}else {
				ctx.fillRect(sx,  sy, 5, my+10);
				sy += my+10;
		        ctx.fillRect(sx,  sy, dx-15, 5);
				sx += dx;
			}

//	        ctx.fillRect(b.x+(b.w/2)-10,  b.y, 20, my);
		}
        ctx.fillStyle = "#000000";

		// draw input snap
		if( showsnaps == 1){
			if( b.snaps[0].side == "-l"){
				drawImage(ctrl.snapimg[0], b.snaps[0].x, b.snaps[0].y);
			}else {
				drawImage(ctrl.snapimg[2], b.snaps[0].x, b.snaps[0].y);
			}
		}else if( b.snaps[0].paired != null){
			sn = b.snaps[0];
			if( sn.side == "-l"){
				sx = sn.x-15;
				sy = sn.y+sn.h/2 - 2;
				sw = 30;
				sh = 5;
			}else {
				sx = sn.x+sn.w/2 -2;
				sy = sn.y-15;
				sw = 5;
				sh = 30;
			}

			ctx.fillStyle = powerColors[b.chain];
			ctx.fillRect(sx, sy, sw, sh);
		}
		// draw output snap
		if( showsnaps == 1){
			if( osnap.side == "-r"){
				drawImage(ctrl.snapimg[1], osnap.x, osnap.y);
			}else {
				drawImage(ctrl.snapimg[3], osnap.x, osnap.y);
			}
		}

}

function wireSetBitSize(ctrl, ax, ay)
{
	var l,r,t,b;
	var bit = ctrl.bit;
	let osnaps = bit.snaps[1];

	if(osnaps == null){
		osnaps = bit.snaps[3];
	}
	
	if( (bit.btype & 1) == 0){
		l = bit.snaps[0].x +15;
		r = osnaps.x;
		t = bit.y;
		b = bit.y+bit.h;

		bit.x = l;

		bit.w = r-l;
		bit.initw = bit.w;
		
		bit.setOrientation(0);
	}else {
		t = bit.snaps[0].y+15;
		b = osnaps.y;
		l = bit.x;
		r = bit.x+bit.w;

		bit.y = t;

		bit.h = b - t;
		bit.initw = bit.h
		bit.setOrientation(1);
	}
}

function wireDoSave(ctrl)
{
	const b = ctrl.bit;
	let s = new saveargs();
	let osnap = b.snaps[1];
	let corner = 0;

	if( osnap == null){
		osnap = b.snaps[3];
		corner = 1;
	}

	s.addnv("control", "'wire'");
	s.addnv("inx", b.snaps[0].x);
	s.addnv("iny", b.snaps[0].y);
	s.addnv("inside", "'"+b.snaps[0].side+"'");
	s.addnv("outx", osnap.x);
	s.addnv("outy", osnap.y);
	s.addnv("outside", "'"+osnap.side+"'");
	s.addnv("corner", corner);

	return s.getargs();
}

function wireDoLoad(ctrl, initdata ,idx)
{
	let len = initdata[idx];
	let n = 1;
	let param="";
	let val = "";
	const b = ctrl.bit;

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
		}else if( param == "inside"){
			b.snaps[0].side = val;
			if( val == "-t" || val == "-b"){
				b.snaps[0].w = 50;
				b.snaps[0].h = 15;
			}else {
				b.snaps[0].w = 15;
				b.snaps[0].h = 50;
			}
		}else if( param == "outx"){
			b.snaps[1].x = val;
		}else if( param == "outy"){
			b.snaps[1].y = val;
		}else if( param == "outside"){
			b.snaps[1].side = val;
			if( val == "-t" || val == "-b"){
				b.snaps[1].w = 50;
				b.snaps[1].h = 15;
			}else {
				b.snaps[1].w = 15;
				b.snaps[1].h = 50;
			}
		}else if( param == "corner"){
			b.snaps[3] = b.snaps[1];
			b.snaps[1] = null;
			debugmsg("Corner");
		}
	}
}

// wirebit
function wireDoDrag(mx, my)
{
	let ldrag = dragging;
	let sn = null;
	let dx,dy;
	const isnap = dragging.snaps[0];
	const osnap= dragging.snaps[1];

	const wox = osnap.x;
	const woy = osnap.y;
	const wix = isnap.x;
	const wiy = isnap.y;

	if( selected == isnap ){
//		if( osnap.paired != null){		// output snap is paired. use as anchor.
			sn = osnap;
			ldrag = null;
			dx = wox - mx;
			dy = woy - my;
//		}


	}else if( selected == osnap){
//		if( isnap.paired != null){		// input snap is paired. use as anchor.
			sn = isnap;
			ldrag = null;
			dx = mx - wix;
			dy = my - wiy;
//		}
	}
	if( ldrag == null){
		
		if( isnap.side == "-l" && osnap.side == "-r"){
			selected.y = my;
			if( dx > 50){
				selected.x = mx;
			}
		}else if( isnap.side == "-t" && osnap.side == "-b"){
			selected.x = mx;
			if( dy > 50){
				selected.y = my;
			}
		}else {
			// corner
			if( dx > 50){
				selected.x = mx;
			}
			if( dy > 50){
				selected.y = my;
			}
		}

	}


	// move bit to anchor.
	if( sn != null){
		if( sn.side == "-l"){
			dragging.x = sn.x+sn.w;
			dragging.y = sn.y;
		}else if( sn.side == "-t"){
			dragging.x = sn.x;
			dragging.y = sn.y+sn.h;
		}else if( sn.side == "-r"){
			dragging.x = sn.x-50;
			dragging.y = sn.y;
		}else if( sn.side == "-b"){
			dragging.x = sn.x;
			dragging.y = sn.y-50;
		}
	}

	return ldrag;
}

wireBit.prototype = Object.create(control.prototype);

function wireBit(bit)
{	control.call(this, bit);

	this.bit = bit;
	this.points = [];
	this.snapimg = [wirelinimg,wireroutimg ,wiretinimg , wireboutimg];


// wire
	this.Draw = function( )
	{
		wireDraw(this);
	}

// wire
	this.setBitSize = function(ax, ay)
	{
		wireSetBitSize(this, ax, ay);
	}

// wire 
	this.HitTest = function(x, y)
	{	var res = null;

		return res;
	}

//wire
	this.setData = function()
	{
		if( bitform != null){
			bitform.innerHTML="";
		}
	}

	//wire
	this.getData = function()
	{
	}


// wire 
	this.doSave = function()
	{
		return wireDoSave(this);
	}
	
	this.doLoad = function(initdata, idx)
	{
		wireDoLoad(this, initdata, idx);
	}	
	
	this.doDrag = function(mx, my)
	{
		return wireDoDrag( mx, my);
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
	this.connected = [false, false];	// audio connected?
	this.background = "#ffffff";
	this.color = "#000000";
	this.font = "10px Georgia";
	this.name = "Control";
	this.bitimg = 0;

	// control
	this.isbit = function()
	{
		return false;
	}

	// control
	this.issnap = function()
	{
		return false;
	}


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
		let img = defaultimg;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		if( this.bitimg != 0){
			img = this.bitimg;
		}

		ctx.save();
		if( bt == 0){
	       drawImage(img , b.x,  b.y);
		}else {
			ctx.translate( b.x, b.y+b.h);
			ctx.rotate(- Math.PI/2);
	        drawImage( img , b.x,  b.y);
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
		selected = this.bit;
		curctrl = null;			// stop tracking
	}

	// control default version of doDrag()
	// WIRE is main module that uses this call.
	this.doDrag = function(mx, my)
	{	
		return dragging;
	}
		
	//control
	// generic verion of doSave();
	this.doSave = function()
	{	let msg = "1,";

		return msg;
	}
		
//control
	this.doLoad = function(initdata, idx)
	{	let i = initdata[idx];
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
	const b = this.bit;
	let port = 0;		// which input port on the other bit.
	let oport= 0;		// which output port on this bit.
	let sn;

	if( dom == 2){
		this.setup();
	}

	// input 1 or 2?
	sn = from.snaps[2];
	if( sn != null){
		if( sn.paired != null){
			if( sn.paired.bit == b){
				port = 1;
				if( sn.paired == b.snaps[3]){
					oport = 1;
				}
			}
		}
	}
	sn = from.snaps[0];
	if( sn != null){
		if( sn.paired != null){
			if( sn.paired.bit == b){
				port = 0;
				if( sn.paired == b.snaps[3]){
					oport = 1;
				}
			}
		}
	}
	
	if( from.ctrl != null ){

		if( from.ctrl.audioin != null && this.audioout != null ){
			debugmsg("link "+this.name+" to next module port="+port+" oport="+oport);
			if(port == 0){
				this.audioout.connect( from.ctrl.audioin);
			}else {
				this.audioout.connect( from.ctrl.audioin2);
			}
			this.connected[oport] = true;
		}else {
			debugmsg("DOCKTO null");
		}
	}
}

// control
this.undockfrom = function(from, dom)
{	let b = from.ctrl;
	let port = 0;		// which input port on the other bit.
	let oport= 0;		// which output port on this bit.
	let sn;

	// input 1 or 2?
	sn = from.snaps[2];
	if( sn != null){
		if( sn.paired != null){
			if( sn.paired.bit == b){
				port = 1;
				if( sn.paired == b.snaps[3]){
					oport = 1;
				}
			}
		}
	}
	sn = from.snaps[0];
	if( sn != null){
		if( sn.paired != null){
			if( sn.paired.bit == b){
				port = 0;
				if( sn.paired == b.snaps[3]){
					oport = 1;
				}
			}
		}
	}

	if( b != null){
		b.setValue(0, 0);
	}
	
	if( dom == 2){
		if( b != null){
			if( from.ctrl.audioin != null && this.connected[oport]){
				debugmsg("unlink audio "+this.name+" from next module port="+port+" oport="+oport);
				this.connected[oport] = false;
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

	this.print = function()
	{
		debugmsg("control "+this.name);
	}

}


splitterBit.prototype = Object.create(control.prototype);

function splitterBit(bit)
{	control.call(this, bit);

	this.bit = bit;
	this.points = [];
	this.snapimg = [wirelinimg,wireroutimg ,wiretinimg , wireboutimg];
	this.name = "split";
	this.imagename = this.name;
	this.bitimg = this.bit.findImage(this.imagename);


	this.setOrientation = function(bt)
	{   const b = this.bit;

		if( bt == 0){
			b.coords = [ -15, 50, b.w, 10, 0, 0, b.w, 90 ];
			b.suffix = [ "-l", "-r", "-t", "-r" ];
		}else {
			b.coords = [ 50, -15, 10, b.h, 0, 0, 90, b.h ];
			b.suffix = [ "-t", "-b", "-t", "-b" ];
		}

        b.setSnaps();
		return true;
	}

	//splitter
	this.Draw = function( )
	{	const b = this.bit;

		if( b == null){
			return;
		}

        ctx.fillStyle = "#ffffff";
		if( (b.btype & 1) == 0){
			drawImage( this.bitimg , b.x, b.y);
		}else {
			drawImage( this.bitimg+1 , b.x, b.y);
		}
	}


}


