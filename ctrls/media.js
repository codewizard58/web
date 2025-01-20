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
	this.deg = degree;
	this.bit = bit;
	this.gain = null;
	this.osc = null;
	this.webkitstyle = false;
	this.val = 255;		// debug set initial volume
	this.freq= 60;		// middle C in Midi
	this.prevfreq = new delta();
	this.nfreq=0;
	this.audioin = null;
	this.audioout = null;
	this.wave = -128;		// biased by 128
	this.prevwave = new delta();
	this.prevmix = new delta();
	this.range = 12; 	// bend range
	this.a440 = 440;
	this.ival = 0;
	this.mod = 0;		// modulation routing
	this.modgain = 128;	// modulation gain
	this.modfreq = 128;	// modulation freq

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
	{	var b = this.bit;

		if( b == null){
			return;
		}
		bt = b.btype & 7;	// 0 = horiz, 1 == vert

        ctx.fillStyle = "#ffffff";
		if( bt == 0){
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


function sampler(ctrl)
{	this.ctrl = ctrl;
	this.image = null;

	this.setImage = function(image)
	{
		this.image = image;
	}

}


samplerBit.prototype = Object.create(control.prototype);

function samplerBit(bit)
{	control.call(this, bit);
	this.bit = bit;
	this.image = null;
	this.previmage = null;
	this.video = null;
	this.mode = 2;			// 0 = normal, 1 = diff
	this.shift = 0;				// 4 * 2
	this.sampler = new sampler(this);

    let imagename = "sampler";
	this.bitimg =this.bit.findImage(imagename);
	this.bitname = imagename;
	this.name = "Sampler";

	this.Draw = function( )
	{	const b = this.bit;
		let i,j;
		let n;

		if( b == null){
			return;
		}
        ctx.fillStyle = "#ffffff";
		if(this.image != null){
			ctx.putImageData(this.image, b.x, b.y);
		}
	}

}


