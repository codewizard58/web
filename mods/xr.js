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

import {Scene} from './js/render/scenes/scene.js';
import {Renderer, createWebGLContext} from './js/render/core/renderer.js';
import {Gltf2Node} from './js/render/nodes/gltf2.js';
import {SkyboxNode} from './js/render/nodes/skybox.js';
import {QueryArgs} from './js/util/query-args.js';

'use strict';
 var xrSession = null;
 var xrRequested = false;
 var xrOK = false;
 var xrCtrl = null;

// Called when the user clicks the button to enter XR. If we don't have a
// session we'll request one, and if we do have a session we'll end it.
function UIonXRButtonClicked(xrmode) 
{   let f;
  let xr = bitformaction;

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
        f = document.getElementById("xr-button");
        if( f.value != null){
          f.addEventListener('click', UIendXR);
        }
} else if( xrmode == 2){
      if( xrSession != null){
        xrSession.end();
      }
    }
}

function UIstartXR()
{
  UIonXRButtonClicked(1);
}

function UIendXR()
{
  UIonXRButtonClicked(2);
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

function emptyScene()
{
  this.startFrame = function()
  {
  }

  this.endFrame = function()
  {
  }

  this.draw = function( project, transform)
  {

  }

  this.addNode = function(node)
  {
  }

  this.setRenderer = function(renderer)
  {
  }


}

// an XR headset interface bit
//
xrBit.prototype = Object.create(control.prototype);
function xrBit(bit)  
{	control.call(this, bit);
	this.bit = bit;
  // XR globals.
  this.xrRefSpace = null;
  this.gl = null;
  this.scene = null;
  this.renderer = null;

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

    this.scene.startFrame();

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

      for (let view of pose.views) {
        let viewport = glLayer.getViewport(view);
        this.gl.viewport(viewport.x, viewport.y,
                    viewport.width, viewport.height);

        // Draw a scene using view.projectionMatrix as the projection matrix
        // and view.transform to position the virtual camera. If you need a
        // view matrix, use view.transform.inverse.matrix.
        this.scene.draw(view.projectionMatrix, view.transform);
      }
    }
    this.scene.endFrame();

  }


    this.onSessionStarted = function(session)
    {
     
        session.addEventListener('end', onXRSessionEnded);
    
        let canvas = document.createElement('canvas');
        this.gl = canvas.getContext('webgl', { xrCompatible: true });
    
        // Use the new WebGL context to create a XRWebGLLayer and set it as the
        // sessions baseLayer. This allows any content rendered to the layer to
        // be displayed on the XRDevice.

        if( this.scene == null ){
//          this.scene = new emptyScene();
          this.scene = new Scene();
          this.scene.addNode(new Gltf2Node({url: 'media/gltf/space/space.gltf'}));
          this.scene.addNode(new SkyboxNode({url: 'media/textures/milky-way-4k.png'}));
    
        }
    
        debugmsg("renderstate");
        this.renderer = new Renderer(this.gl);

        // Set the scene's renderer, which creates the necessary GPU resources.
        if( this.scene != null){
          this.scene.setRenderer(this.renderer);
        }

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
      let f;

        if( bitform != null){
            bitform.innerHTML="";
        }
        bitformaction = this;

        debugmsg("XR setdata");

        bitform = document.getElementById("bitform");
        if( bitform != null){
            if( xrOK && xrSession == null){
                msg += "<input type='button' id='xr-button' value='Enter XR' />";
            }else if( xrOK && xrSession != null){
              msg += "<input type='button' id='xr-button'  value='Exit XR' />";
            }else {
              msg += "<input type='button' id='xr-button' value='Not available' />";
            }
            msg += "<table>";
            msg += "<tr><th>Headset</th></tr>\n";

            msg += "</table>\n";

            bitform.innerHTML = msg;
            bitformaction = this;

            f = document.getElementById("xr-button");
            if( f.value != null){
              debugmsg("Add handler");
              f.addEventListener('click', UIstartXR);
            }

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

function newXR()
{
  let x;
  
  x = new xrBit( mediaGetBit() );
  mediaSetBit(x);

}


function initXR()
{ let f;

   f = document.getElementById("xrbutton");
  if( f != null){
    f.addEventListener("click" , newXR);
    f.value = "Show XR";
  }
}

initXR();


