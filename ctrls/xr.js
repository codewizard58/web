//
//Copyright 2018 The Immersive Web Community Group

//Permission is hereby granted, free of charge, to any person obtaining a copy of
//this software and associated documentation files (the "Software"), to deal in
//the Software without restriction, including without limitation the rights to
//use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
//the Software, and to permit persons to whom the Software is furnished to do so,
//subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
//FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
//COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
//IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
//CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


//<html>
//  <head>
//    <meta charset='utf-8'>
//    <meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=no'>
//    <meta name='mobile-web-app-capable' content='yes'>
//    <meta name='apple-mobile-web-app-capable' content='yes'>
//    <link rel='icon' type='image/png' sizes='32x32' href='favicon-32x32.png'>
//    <link rel='icon' type='image/png' sizes='96x96' href='favicon-96x96.png'>
//    <link rel='stylesheet' href='css/common.css'>

//    <title>Barebones VR</title>
//  </head>
//  <body>
//    <header>
//      <details open>
//        <summary>Barebones VR</summary>
//        <p>
//          This sample demonstrates extremely simple use of an "immersive-vr"
//          session with no library dependencies. It doesn't render anything
//          exciting, just clears your headset's display to a slowly changing
//          color to prove it's working.
//          <a class="back" href="./">Back</a>
//        </p>
//        <button id="xr-button" class="barebones-button" disabled>XR not found</button>
//      </details>
//    </header>
//    <main style='text-align: center;'>
//      <p>Click 'Enter VR' to see content</p> 
//    </main>
//    <script>
'use strict';
 var xrSession = null;
 var xrRequested = false;
 var xrOK = false;
 var xrCtrl = null;

// Called when the user clicks the button to enter XR. If we don't have a
// session we'll request one, and if we do have a session we'll end it.
function UIonXRButtonClicked(xrmode) 
{ 
  const xr = bitformaction;

    debugmsg("UIonXRButtonClicked "+xrmode);

    if( xr != xrCtrl){
      debugmsg("xr != xrCtrl");
      return;
    }
    if( xr == null){
      return;
    }

    if( xrmode == 0){
        xr.getData();
        xr.setData();
        return;
    }
    
    if( xrmode == 1){
        if (xrSession== null && xrRequested == false) {
          xrRequested = true;
          navigator.xr.requestSession('immersive-vr').then(onXRSessionStarted);
        }
    } else if( xrmode == 2){
      if( xrSession != null){
        xrSession.end();
      }
    }
}

// Called when we've successfully acquired a XRSession. In response we
// will set up the necessary session state and kick off the frame loop.
function onXRSessionStarted (session)
{   let xr = xrCtrl;
    xrSession = session;

    xr.onSessionStarted( session);
}

function onXRSessionEnded(event)
{
  if( xrCtrl != null){
    xrCtrl.onSessionEnded(event);
  }

}

function onXRFrame(time, frame) 
{ 
    xrCtrl.onXRFrame(time, frame);
}

xrBit.prototype = Object.create(control.prototype);
function xrBit( bit) 
{	control.call(this, bit);
	this.bit = bit;
  // XR globals.
  this.xrRefSpace = null;
  this.gl = null;

  this.initXR = function() {
      if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
          if (supported) {
            xrOK = true;
          }
        });
      }
  }

  this.onXRFrame = function(time, frame)
  {
    let session = frame.session;

    session.requestAnimationFrame(onXRFrame);

    let pose = frame.getViewerPose(this.xrRefSpace);

    if (pose) {
      let glLayer = session.renderState.baseLayer;

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, glLayer.framebuffer);

      this.gl.clearColor(Math.cos(time / 2000),
                    Math.cos(time / 4000),
                    Math.cos(time / 6000), 1.0);

      // Clear the framebuffer
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      /*for (let view of pose.views) {
        let viewport = glLayer.getViewport(view);
        gl.viewport(viewport.x, viewport.y,
                    viewport.width, viewport.height);

        // Draw a scene using view.projectionMatrix as the projection matrix
        // and view.transform to position the virtual camera. If you need a
        // view matrix, use view.transform.inverse.matrix.
      }*/
    }
  }


    this.onSessionStarted = function(session)
    {
     
        session.addEventListener('end', onXRSessionEnded);
    
        let canvas = document.createElement('canvas');
        this.gl = canvas.getContext('webgl', { xrCompatible: true });
    
        // Use the new WebGL context to create a XRWebGLLayer and set it as the
        // sessions baseLayer. This allows any content rendered to the layer to
        // be displayed on the XRDevice.
        debugmsg("renderstate");
        session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.gl) });
    
        // Get a reference space, which is required for querying poses. In this
        // case an 'local' reference space means that all poses will be relative
        // to the location where the XRDevice was first detected.
        session.requestReferenceSpace('local').then((refSpace) => {
            this.xrRefSpace = refSpace;
    
            // Inform the session that we're ready to begin drawing.
            session.requestAnimationFrame(onXRFrame);
        });
    }
    
    
      // Called either when the user has explicitly ended the session by calling
      // session.end() or when the UA has ended the session for any reason.
      // At this point the session object is no longer usable and should be
      // discarded.
      this.onSessionEnded =function (event) {
        debugmsg("XR session ended");
        xrSession = null;
        // In this simple case discard the WebGL context too, since we're not
        // rendering anything else to the screen with it.
        this.gl = null;
        xrRequested = false;
      }

      // Called every time the XRSession requests that a new frame be drawn.
    this.setData = function()
    {	let msg="";

        if( bitform != null){
            bitform.innerHTML="";
        }
        bitformaction = this;

        debugmsg("XR setdata");

        bitform = document.getElementById("bitform");
        if( bitform != null){
            if( xrOK && xrSession == null){
                msg += "<input type='button' id='xr-button'  onclick='UIonXRButtonClicked(1);' value='Enter XR' />";
            }else if( xrOK && xrSession != null){
              msg += "<input type='button' id='xr-button'  onclick='UIonXRButtonClicked(2);' value='Exit XR' />";
            }else {
              msg += "<input type='button' id='xr-button'  onclick='UIonXRButtonClicked(0);' value='Not available' />";
            }
            msg += "<table>";
            msg += "<tr><th>Headset</th></tr>\n";

            msg += "</table>\n";

            bitform.innerHTML = msg;
            bitformaction = this;

        }

    }


    this.getData = function()
    {	let f = null;
      let s = new saveargs();

      s.addarg("control");
      s.addarg( "headset");

      this.doLoad(s.getdata(), 0);
    }

  this.doLoad = function(initdata, idx)
	{	let param="";
		let val = "";

    debugmsg("XR doload");

  }

  this.initXR();
  xrCtrl = this;

}
//    </script>
//  </body>
//</html>