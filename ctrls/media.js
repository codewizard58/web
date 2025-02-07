// media objects
//
// 1/16/25
// if (!navigator.mediaDevices?.enumerateDevices) {
//     console.log("enumerateDevices() not supported.");
//   } else {
    // List cameras and microphones.
//     navigator.mediaDevices
//       .enumerateDevices()
//       .then((devices) => {
//         devices.forEach((device) => {
//           console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
//         });
//       })
//       .catch((err) => {
//         console.error(`${err.name}: ${err.message}`);
//       });
//   }

var vctx = null;
  

micBit.prototype = Object.create(control.prototype);

function micBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.webkitstyle = false;
	this.val = 255;		// debug set initial volume
	this.audioin = null;
	this.audioout = null;
	this.ival = 0;

    let imagename = "mic";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Mic";

	this.setup = function(){
		if( this.audioout == null){
			const constraints = { audio: true };
			navigator.mediaDevices
				.getUserMedia(constraints)
				.then((stream) => {
					source = actx.createMediaStreamSource(stream);
					this.audioout = source;
					debugmsg("Create microphone");
				})
				.catch(function (err) {
				debugmsg("The following error occured: " + err);
			});
		}
	}

	// microphone
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

	this.setup();

}


videoBit.prototype = Object.create(control.prototype);

function videoBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.audioin = null;
	this.audioout = null;
	this.image = null;
	this.previmage = null;
	this.video = null;
	this.mode = 0;			// 0 = normal, 1 = diff, 2 neg
	this.shift = 0;				// 4 * 2
	this.gain = null;
	this.mix = 0;
	this.prevmix = new delta();

    let imagename = "mic";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Video";

	this.setup = function(){
		let f;
		if( vctx == null){
			f = document.getElementById("videocanvas");
			if( f != null){
				vctx = f.getContext('2d');
			}
		}
	
		if( this.audioout == null){
			const constraints = { audio: true, video: true };
			navigator.mediaDevices
				.getUserMedia(constraints)
				.then((stream) => {
						source = actx.createMediaStreamSource(stream);
						debugmsg("Create video");
						this.video = document.querySelector("video");
						this.video.srcObject = stream;
						this.video.onloadedmetadata = () => {
						this.video.play();
						this.video.volume = 0.0;

						if( this.gain == null){
							// create a new node
							if( typeof( actx.createGainNode) != "undefined"){
						//		alert ("use gain node");
								this.webkitstyle = true;
								this.gain = actx.createGainNode();
							}else {
								this.gain = actx.createGain();
							}
							this.gain.gain.setTargetAtTime( 0, 0, 0.01);
							source.connect( this.gain); 
						}
						this.prevmix.changed(-1);
						this.audioout = this.gain;
			
						};
					}
				)
				.catch(function (err) {
					debugmsg("The following error occured: " + err);
			});
		}
	}

	this.setValue = function(data, chan)
	{	const bit = this.bit;
		let mix = 0.0;

		if( chan == 0){
			this.mix = checkRange(data);
			indicator_spin(4);
			indicator(data, 5);

			if( this.mix != 0){		// mix of 0 also freezes the video.
				this.doEffects();
			}
		}else {
			return;
		}

		mix = this.mix / 256;

		if( this.prevmix.changed(mix)){
			if(this.gain != null){
				this.gain.gain.setTargetAtTime( mix, 0, 0.05);
			}
		}

	}

	// video - setValue drives stuff. So no power no effects.
	this.doEffects = function()
	{	const b = this.bit;
		let n;
		let i;
		let j;

		if( this.mode == 0){
			this.curImage = 0;
		}

		this.previmage = this.image;
		if(this.previmage != null && this.image!= null ){
			if( this.mode == 1 ){
				n = 0;
				for(i=0; i < b.h; i++){
					for(j=0; j < b.w - this.shift; j++){
						this.previmage.data[n] = checkRange(this.previmage.data[n] - this.image.data[n+this.shift]);
						this.previmage.data[n+1] = checkRange(this.previmage.data[n+1] - this.image.data[n+1+this.shift]);
						this.previmage.data[n+2] = checkRange(this.previmage.data[n+2] - this.image.data[n+2+this.shift]);

						n += 4;
					}
					n += 4*this.shift;
				}
				this.curImage = 1;
			}else if(this.mode == 2 ){
				n = 0;
				for(i=0; i < b.h; i++){
					for(j=0; j < b.w ; j++){
						this.previmage.data[n] =   256 - this.image.data[n+this.shift];
						this.previmage.data[n+1] = 256 - this.image.data[n+1+this.shift];
						this.previmage.data[n+2] = 256 - this.image.data[n+2+this.shift];

						n += 4;
					}
				}
				this.curImage = 1;
			}
		}else {
			debugmsg("image is null");
		}
	}

	// video
	this.Draw = function( )
	{	const b = this.bit;

		if( b == null){
			return;
		}

		if( this.mix > 0 || this.image == null){					// use mix == 0 to freeze video, allow first.
			this.image = null;
			if( this.video != null){
				vctx.drawImage(this.video, 0, 0, b.w, b.h);
				this.image = vctx.getImageData(0, 0, b.w, b.h);
			}
		}

		// this.mix is input and has to be non 0

        ctx.fillStyle = "#ffffff";
		if( this.curImage == 1){
			if(this.previmage != null){
				ctx.putImageData(this.previmage, b.x, b.y);
			}
		}else if(this.image != null){
			ctx.putImageData(this.image, b.x, b.y);
		}

	}

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
			msg += "<tr><th>Effect</th><td><select id='videomode' >";
			msg += "<option value='0' "+isSelected(this.mode, 0)+">Normal</option>";
			msg += "<option value='1' "+isSelected(this.mode, 1)+">Edge</option>";
			msg += "<option value='2' "+isSelected(this.mode, 2)+">Color reversed</option>";
			msg +="</select></td></tr>\n";
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
		s.addarg( "video");

        f = document.getElementById("videomode");
        if( f != null){
            s.addarg("videomode");
            s.addarg(f.value);
        }
		this.doLoad( s.getdata(), 0);
	}


	this.doLoad = function(initdata, idx)
	{	var len = initdata[idx];
		let n = 1;
		let param="";
		let val = "";

		for(n = 1; n < len ; n += 2){
			param = initdata[idx+n];
		    val = initdata[idx+n+1];
			debugmsg("Video "+param+" "+val);
            if( param == "'control'"){
				continue;
			}
			if( param == "videomode"){
				this.mode = val;
			}
		}

	}

	this.setup();

}

// not a control.
// a utility object
//
function sampler(ctrl)
{	this.ctrl = ctrl;
	this.image = null;
	this.data = null;
	this.values = [];
	this.points = [];
	this.w = 0;
	this.h = 0;
	this.beats = 32;
	this.max = 0;
	this.dir = 1;
	this.tick = 0;
	this.pingpong = 0;
	this.gate = 128;
	this.tempo =180;



	this.setImage = function(image)
	{
		this.image = image;
	}

	this.setData = function(data)
	{
		this.data = data;
		debugmsg("SETDATA "+this.data.length);
	}

	this.setSize = function(w, h)
	{
		this.w = w;
		this.h = h;
	}

	this.setPoints = function( points, max)
	{
		this.points = points;
		this.max = max;
	}

	this.setValues = function( values, max)
	{
		this.values = values;
		this.max = max;
	}

	this.radial = function(ix, iy)
	{	let dx;
		let dy;
		let x;
		let y;
		let cnt;
		let idx;
		const sw = this.w / 256;
		const sh = this.h / 256;

		// use points to sample image.
		dx = (ix - 128) / this.beats;
		dy = (iy - 128) / this.beats;

//				debugmsg("Start new line "+this.ix+" "+this.iy);
		x = 128;
		y = 128;
		for(cnt=0; cnt < this.beats; cnt++){
			this.points[cnt] = new mpoint(Math.floor(x), Math.floor(y));
			idx = Math.floor(sh * y)*this.w + Math.floor(sw * x);
			if( this.data != null){
				this.values[cnt] = this.data[idx];
			}
			x = x+dx;
			y = y+dy;
		}
		this.max = cnt;
		debugmsg("End new line "+x+" "+y);
	}

//sampler
	this.getValue = function()
	{
		if( this.dir > 0){
			this.tick++;
		}else {
			this.tick--;
		}

		if( this.tick >= this.max){
			if( this.pingpong ){
				this.dir = -this.dir;
				this.tick = this.max -1;
			}else {
				this.tick = 0;
			}
		}
		if( this.tick < 0){
			this.tick = 0;
			if( this.pingpong ){
				this.dir = - this.dir;
			}else if( this.max > 0){
				this.tick = this.max-1;
			}
		}
		return this.values[this.tick];
	}

	this.position = function()
	{
		return this.tick;
	}

}


