/// sound bits
// softbits are inspired by the Littlebits snap together hard modules. 
// the snaps have magnets so that inputs snap to outputs, but input repel inputs 
// and outputs repel outputs. Each snap provides power and a single analog data wire.
// Ths softbits execution model links bits into chains and each chain has a single value
// that can be modified by each bit in the chain. Bits with two inputs get the second value from another 
// chain, bits with two output write the second output to another chain start.
//
// the execution is done by byte codes with zero, one or two extra bytes. The chain data is nominally
// 0 - 255 to mimic the Littlebits 0-5 volt range.
//
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
