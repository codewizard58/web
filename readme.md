/// sound bits
// https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode
//
// control are self draw objects that need more state than simple "bits".
// see softbitsctrls.js
//
// HitTest() - check what was clicked on.
// Draw() - draw it.
// setValue() - called by the "program" to set the value(s)
// setData() - Generate the form area that has manual settings
// getData() - Read the form area and update the settings
// onMove() - allow adjustment by mouse movement.
//
// bit - defines something that can be drawn on the canvas and dragged around.
// snap - a bit can have up to 4 snaps and these handle the docking logic
//       that allows bits to be connected.
