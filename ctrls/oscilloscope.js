//////////////////////////////////////////////////////////////////////
// oscilloscope
//
graphBit.prototype = Object.create(control.prototype);


function graphBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.hdata = new Array(20);
	this.hdata2= null;
	this.speed=1;
	this.curpos=0;		// width position
	this.mode = 0;		// graph mode, 1 = capture, 2 = replay.
	this.run = 0;		// 2nd is graph2, 1 = stop/start
	this.running = 0;
	this.sx = 0;
	this.sy = 0;
	this.prev = 0;		// for replay / once / start
	this.values = [0];	// setValue data for channel 0
	this.roll = 0;		// piano roll
	this.retrig = 1;	// retrigger.
	this.inset = 20;
// graph default
	this.bars = 180;
	this.color = "white";
	this.background = "#004400";
	this.grid = 1;
	this.scroll = 1;	// scroll display
	this.savemode = false; // used by dosave and getdata.

	
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


	// graph
	this.HitTest = function(mx, my)
	{	let b = this.bit;
		let x = mx-b.x;
		let y = my-b.y;

		if( this.mode == 1){
			if( x > 0 && x < b.w && y > 0 && y < b.h ){
				debugmsg("GRAPH HT "+x+" "+y+" "+b.w+" "+b.h);
				return this;
			}
		}

		return null;
	}

	// graph
	this.Draw = function( )
	{	const b = this.bit;
		const inset = this.inset;
		const i2 = Math.floor(inset /2);
		const len = this.hdata.length;
		const w = b.w-this.inset;
		const perstep = len / w;
		const step = Math.floor(this.curpos* perstep );
		const width = w / len;			// 1/perstep
		let bt;
		let xval, xval2;
		let p;
		let xtmp, xtmp2;
		let tmp;
		let i, j, h;
		let prev;
		let left, top;
		let bottom, height;
		let right;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert
		xval = b.data;

		p = this.getDockedBit(2);

		if( p == null){
			xval2 = 0;
		}else {
			xval2 = softprogram.chains[p.chain].data;
		}
		left = b.x+i2;
		right = left + w;
		top = b.y+i2;
		height = b.h - inset;
		bottom = top + height;

        ctx.fillStyle = this.background;	// background
        ctx.fillRect(left,  top , b.w-inset, height);

		if( this.grid ==1){
			ctx.fillStyle = "#00cc00";	// graticule
			for(i=0; i < b.w-20; i+= 10){
				ctx.fillRect(left+10+i,  top, 1, height);
			}
			for(i=0; i < b.h-20; i+= 10){
				ctx.fillRect(left,  top+10+i, b.w-inset, 1);
			}
		}

        ctx.fillStyle = this.color;
		if( this.scroll){
			j = step;
		}else {
			j = 0;
		}
		xtmp2 = 80;

		if( p == null && this.hdata2 != null){
			this.hdata2 = null;
		}

		if( this.mode == 0){		// graph mode?
			if( this.hdata2 != null){
				ctx.fillStyle = "#ff0000";
				xtmp = this.hdata2[j];
				tmp	= Math.floor((xtmp * xtmp2) / 256);
				prev = tmp;
				for(i=0; i < len; i++){
					xtmp = this.hdata2[j];
					tmp	= Math.floor((xtmp * xtmp2) / 256);
					if( tmp > prev){
						h = tmp - prev;
						ctx.fillRect(b.x+b.w-10-i, b.y+b.h-12-tmp, 2, 2+h);
					}else {
						h = prev - tmp;
						ctx.fillRect(b.x+b.w-10-i, b.y+b.h-12-tmp-h, 2, 2+h);
					}

					prev = tmp;
					j--;
					if( j < 0){
						j = len -1;
					}
				}
				ctx.fillStyle = "#ffffff";
			}
		}

		if( this.scroll){
			j = step;
		}else {
			j = 0;
		}
		j--;
		if( j < 0 || j >= len){
			j = len -1;
		}
		xtmp = this.hdata[j];
		tmp	= Math.floor((xtmp * xtmp2) / 256);
		prev = tmp;
		if( width > 2){
			let iw = width;
			let tw = Math.floor(width+1);
			for(i=0; i < len; i++){
				xtmp = this.hdata[j];
				tmp	= Math.floor((xtmp * xtmp2) / 256);
				if( iw < w){	// still room
					if( (w - iw) < tw){
						tw = w-iw;		// whats left.
					}
					if( tmp > prev){
						h = tmp - prev;
						ctx.fillRect(Math.floor(right-iw), bottom-tmp, tw, h+1);
					}else {
						h = prev - tmp;
						ctx.fillRect(Math.floor(right-iw), bottom-tmp-h, tw, h+1);
					}
				}
				iw = iw+width;

				prev = tmp;
				j--;
				if( j < 0){
					j = len -1;
				}
			}
		}else {
			ctx.strokeStyle = this.color;
			ctx.beginPath();
			ctx.moveTo(right, bottom - tmp);
	
			for(i=1; i < b.w-inset; i += width){
				xtmp = this.hdata[j];
				tmp	= Math.floor((xtmp * xtmp2) / 256);
				ctx.lineTo(right-i, bottom-tmp);
				prev = tmp;
				j--;
				if( j < 0){
					j = len-1;
				}
			}
			ctx.stroke();
		}

        ctx.fillStyle = "#000000";
	}

	this.setValue = function(data, chan)
	{	const b = this.bit;
		const w = b.w-this.inset;
		const len = this.hdata.length;
		let perstep = len / w;
		let step = Math.floor(this.curpos* perstep );

//		debugmsg("STEP "+step+" "+this.curpos+" "+w);
		if( chan == 0){
			if( this.mode != 1 && this.mode != 3){		// not scribble and not drawing.
				if( this.run != 1 || this.curpos > 0){	// not once or not paused
					this.curpos++;
				}else if( this.run == 1 && this.curpos == 0){	// once and paused
					// start on note ?
					if( this.prev <= 20 && data > 20){	// trigger start
						this.curpos++;
					}
					this.prev = data;
				}
				if( this.curpos >= b.w-this.inset){
					this.curpos = 0;
				}
				if( this.run == 1 && this.retrig == 1 && data == 0){
					this.curpos = 0;
				}
			}
			if( this.mode == 0){			// graph
				this.hdata[step] = data;
				while(perstep > 1){
					step++;
					this.hdata[step] = data;
					perstep--;
				}
			}else if( this.mode ==2){		// replay
				b.value = this.hdata[step];
			}
		}else {
			if( this.hdata2 == null){
				this.hdata2 = new Array(len);
				for(i=0; i< this.hdata2.length;i++){
					this.hdata2[i] = 0;
				}
			}
			this.hdata2[step] = data;
			while(perstep > 1){
				step++;
				this.hdata2[step] = data;
				perstep--;
			}
		}

	}

	this.getData = function()
	{	let f;
		let s = new saveargs();
		let x;

		s.addnv("control", "'graph'");

		f = document.getElementById("scribble");
		if( f != null){
			s.addnv("scribble", f.value*1);
		}else {
			s.addnv("scribble", this.mode);
		}
		
		if( this.mode != 0){
			f = document.getElementById("runmode");
			if( f != null){
				s.addnv("runmode", f.value*1);
			}else {
				s.addnv("runmode", this.run);
			}

		}
		f = document.getElementById("scroll");
		x = 1;
		if( f != null){
			if( !f.checked ){
				x = 0;
			}
			s.addnv("scroll", x);
		}else {
			s.addnv("scroll", this.scroll);
		}
		f = document.getElementById("grid");
		x = 1;
		if( f != null){
			if( !f.checked ){
				x = 0;
			}
			s.addnv("grid", x);
		}else {
			s.addnv("grid", this.grid);
		}
		f = document.getElementById("retrig");
		x = 1;
		if( f != null){
			if( !f.checked ){
				x = 0;
			}
			s.addnv("retrig", x);
		}else {
			s.addnv("retrig", this.retrig);
		}
		f = document.getElementById("bars");
		if( f != null){
			s.addnv("bars", f.value*1);
		}else {
			s.addnv("bars", this.bars);
		}
		if( this.savemode){
			return s.getdata();
		}
		this.doLoad(s.getdata(), 0);	
	}

	this.setData = function()
	{	let msg = "";

		if( bitform != null){
			bitform.innerHTML="";
		}
		
		bitform = document.getElementById("bitform");
		if( bitform != null){
			msg+= "<table><tr><th>Mode</th>";
			msg += "<td><select id='scribble' onchange='UIrefresh(1, 0);' ><option value='0' "+isSelected(this.mode, 0)+">Graph</option>";
			msg += "<option value='1'  "+isSelected(this.mode, 1)+">Scribble</option>";
			msg += "<option value='2'  "+isSelected(this.mode, 2)+">Replay</option>";
			msg += "<option value='1'  "+isSelected(this.mode, 3)+">Capture</option>";
			msg += "</select></td>\n";
			if( this.mode != 0){
				msg += "</tr><tr><th><select id='runmode' onchange='UIrefresh(1, 0);' >";
				msg += "<option value='2' "+isSelected(this.run, 2)+" >Loop</option>";
				msg += "<option value='1' "+isSelected(this.run, 1)+">Once</option>";
				msg += "</select></td>\n";
				if( this.run == 1){
					msg += "<td><input type='button' id='running' value='Run' onclick='UIrefresh(1, 1);' />\n";
					msg += "<th>Retrigger</th><td><input type='checkbox' id='retrig' "+isChecked(this.retrig == 1)+" onchange='UIrefresh(1, 0);'/></td>\n";
				}
			}
			msg += "</tr><tr><th>Scroll</th><td><input type='checkbox' id='scroll' "+isChecked(this.scroll == 1)+" onchange='UIrefresh(1, 0);'/></td>";
			msg += "<th>Grid</th><td><input type='checkbox' id='grid' "+isChecked(this.grid == 1)+" onchange='UIrefresh(1, 0);'/></td>";
			msg += "</tr><tr><th>Bars</th><td colspan='3' ><input type='text' id='bars' value='"+this.bars+"' onchange='UIrefresh(1, 0);'/></td>";
			msg += "</tr></table>\n";

			bitform.innerHTML = msg;
			bitformaction = this;
		}
	}

	this.onMove = function(mx, my)
	{	var b = this.bit;
		var bt;
		let x = mx-b.x;
		let y = my-b.y+10;
		let i;
		let width;
		let step;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		if( x < 0 || x > b.w){
			this.sx = x;		// dont jump is move out of bit.
			return;
		}
		if( y < 0 || y > b.h){
			return;
		}


		if( this.mode == 3){

			x -= 10;

			if( x < 0){
				x = 0;
			}
			width = b.w - this.inset;
			step = Math.floor( x*this.bars / width);

			if( step > this.hdata.length){
				step = this.hdata.length;
			}

//			debugmsg("Move: "+x+" "+y+" step="+step);

			yval = (b.h - y)*3;
			yval = checkRange(yval)
			xval = step;
			this.hdata[xval] = yval;
			len = xval - this.sx;
			i = this.sx;
			if( len < 0){
				len = -len;
				i = xval;
			}
			if( len > 0 && len < 100){
				while(len > 0){
					this.hdata[i] = yval;
					i++;
					len--;
				}
			}
			this.sx = xval+1;
		}

	}


	this.startMove = function(mx, my)
	{	var b = this.bit;
		var bt;
		let width;
		let step;
		let x; 

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

		x = mx-b.x;
		width = b.w - this.inset;
		step = Math.floor( x * this.bars / width);
//		debugmsg("START "+x+" "+width+" "+step);

		if( step > this.hdata.length){
			step = this.hdata.length;
		}

		this.sx = step;
		this.sy = my-b.y;
		this.mode = 3;
	}


	this.stopMove = function()
	{
		if( this.mode == 3){
			this.mode = 1;
		}
	}

	this.doSave = function()
	{	let msg = "";
		let s = new saveargs();
		let cnt;
		let d;

		this.savemode = true;
		d =  this.getData();
		this.savemode = false;
		s.setdata(d);

		s.addarg(stringValue("data"));
		for(cnt = 0; cnt < this.bars; cnt++){
			s.addarg( this.hdata[cnt]);
		}

		return s.getargs();
	}
		
	this.doLoad = function(initdata,  idx)
	{	let i = initdata[idx];
		let ip = idx;
		let cnt = 0;
		let code="";

		debugmsg("DOLOAD "+i+" "+idx+" "+(initdata.length));
		while( ip+2 < i+idx && ip+2 < initdata.length){
			code = initdata[ip+1];
			if( code == "'scribble'" || code == "scribble"){
				this.mode = initdata[ip+2];

				if( this.mode == 1){
					// start scribble
					this.curpos = 0;
					this.running = 0;
				}else if( this.mode == 0){
					this.run = 0;  // clear loop / play.
				}
			}else if(code == "'scroll'" || code == "scroll"){
				this.scroll = initdata[ip+2];
			}else if(code == "'grid'"|| code == "grid"){
				this.grid = initdata[ip+2];
			}else if(code == "'retrig'" || code == "retrig"){
				this.retrig = initdata[ip+2];
			}else if(code == "'runmode'" || code == "runmode"){
				this.run = initdata[ip+2];
			}else if(code == "'bars'" || code == "bars"){
				if( this.bars != initdata[ip+2]){
					this.bars = initdata[ip+2];
					this.setSize(this.bars);
				}
			}else if(code == "'data'" || code == "data"){
				for(cnt = 0; cnt < this.bars; cnt ++){
					this.hdata[cnt] = initdata[ip+2+cnt];
				}
				ip += this.bars-1;
				this.curpos = 0;
			}
			ip += 2;
		}

	}		
		
	this.dock = function(from)
	{
	}

	this.undock = function(from)
	{
	}

	//
	this.setSize = function(len)
	{	let i;

		this.hdata = new Array(len);
		for(i=0; i < len; i++){
			this.hdata[i] = 0;
		}
		if( this.hdata2 != null){
			this.hdata2 = new Array(len);
			for(i=0; i < len; i++){
				this.hdata2[i] = 0;
			}
			}
	
	}

	this.setSize(this.bars);

}


///////////////////////////////
///
counterBit.prototype = Object.create(control.prototype);

function counterBit(bit)
{	control.call(this, bit);
	this.transport = new transport();
	this.value = 0;

	this.transport.setTempo(50, 1);
	this.transport.resume();

	this.setValue = function(data, chan)
	{	let now;

		if( chan == 0){
			if( data > 127){
				if( this.transport.delta < 0){
					this.transport.delta = -this.transport.delta;
				}
			}else if( data > 0){
				if( this.transport.delta > 0){
					this.transport.delta = -this.transport.delta;
				}
			}

			if( data > 0){
				now  = performance.now();
				this.transport.run(now);
			}
		}
		if( this.transport.trigger > 0){
			this.transport.trigger--;
		}
		this.value = this.transport.getValue();
		this.bit.value = this.value;
	}

	
}