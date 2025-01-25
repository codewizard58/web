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
	this.mode = 2;			// 0 = normal, 1 = diff
	this.shift = 0;				// 4 * 2

    let imagename = "mic";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Video";

	this.setup = function(){
		if( this.audioout == null){
			const constraints = { audio: true, video: true };
			navigator.mediaDevices
				.getUserMedia(constraints)
				.then((stream) => {
					source = actx.createMediaStreamSource(stream);
					this.audioout = source;
					debugmsg("Create video");
					this.video = document.querySelector("video");
					this.video.srcObject = stream;
					this.video.onloadedmetadata = () => {
					  this.video.play();
					};
								})
				.catch(function (err) {
				debugmsg("The following error occured: " + err);
			});
		}
	}

	// video
	this.Draw = function( )
	{	const b = this.bit;
		let i,j;
		let n;

		if( b == null){
			return;
		}
		this.previmage = this.image;
		this.image = null;

		if( this.image == null && this.video != null){
			ctx.drawImage(this.video, b.x, b.y, b.w, b.h);
			this.image = ctx.getImageData(b.x, b.y, b.w, b.h);

		}

        ctx.fillStyle = "#ffffff";
		if(this.image != null){
			if( this.mode == 1 && this.previmage != null){
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
				ctx.putImageData(this.previmage, b.x, b.y);
			}else if(this.mode == 2&& this.previmage != null){
				n = 0;
				for(i=0; i < b.h; i++){
					for(j=0; j < b.w ; j++){
						this.previmage.data[n] =   256 - this.image.data[n+this.shift];
						this.previmage.data[n+1] = 256 - this.image.data[n+1+this.shift];
						this.previmage.data[n+2] = 256 - this.image.data[n+2+this.shift];

						n += 4;
					}
				}
				ctx.putImageData(this.previmage, b.x, b.y);
			}else{
				ctx.putImageData(this.image, b.x, b.y);
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


