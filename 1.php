<?php 
?>
<link rel="shortcut icon" href="http://www.moogmusic.com/sites/default/files/moog_favicon.ico" type="image/x-icon" />
<link rel="stylesheet" media="all" href="/common.css" type="text/css" />
<link rel="stylesheet" media="all" href="src/src.css" type="text/css" />
<center>
<a href="/index.php"><img src="/images/modders.jpg" /></a>
<h1>Softbits Live</h1>
</center>
<script type="text/javascript">

function setVid(vid)
{	var ut = document.getElementById('utube');
	var msg= "<iframe width='420' height='315' src='"+vid+"' frameborder='0' allowfullscreen=''></iframe>";

	ut.innerHTML=msg;
}


</script>

<table>
<tr>
<td >
<div class="menubar">
<h2>&nbsp;</h2>
</div>

<div>
<?php
$currenttab = "softbitslive";
include("../../common/littlebits-related.php");
?>
</div>

<div class="menubar">
<h2>Introduction</h2>
</div>

<div class="box" style="padding:20px;min-width:800" >

<p><a href="littlebits.cc">LittleBits</a> makes snap together modules. The modules use
a simple 3 wire interface with magnetic snaps. The magnets are arranged so that an input and an output can 
be snapped together. The three wires are the two power supply wires, 0 volts (GND) and +5 volts (VCC). 
The third middle wire is the signal wire.
Because of the magnets, if you try to connect two outputs together they push away from each other.
</p>
<p>
Softbits Live provides a <a href="web/softbitslive.htm">WEB INTERFACE</a> that presents a drag and drop interface where you can snap
together <a href="../softbits">Softbits</a>. Some of the softbits work in the web page and some control
softbits in the Softbits Live sketch running on an Arduino. 
</p>

</div>

<div class="menubar" >
<h2>Softbits Live - blog</h2>
</div>

<div class="box" style="padding:20px;min-width:800" >
        <p>
          <a href="day8/softbitslive.htm">Day 8</a>. Basic bytecode being generated and executed in the browser. wire_split and arith_invert do stuff.
        </p>
        <p>Day 9. Added a counter, dimmer and setValue to the action set. wire split only works correctly when both output
        snaps have bits docked to them. If only one of the wire split output snaps is connected then it should just act as
      a passthru.
      </p>
        <p>Day 10. Changed the wire graphics and the background. Did some internal re-factoring. Started to add support 
        for 'controls' such as a slider and indicators such as a bar graph. Added auto select of scanning snap when dragging
      the bit body rather than a snap.</p>

</div>

<div class="menubar" >
<h2>Why Softbits?</h2>
</div>

<div class="box" style="padding:20px;min-width:800" >
<p>
Writing complex programs on any platform can be daunting. Since LittleBits are targeted at
kids and beginners, the programming bar for the Arduino is quite high. Simple programs that 
do basic input and output are easy to implement but tasks that Softbits have been developed
for are things such as software envelope generators and Midi data processing to control
kits such as the <a href="http://littlebits.cc/kits/synth-kit">"LittleBits KORG Synth Kit"</a>.

</p>
</div>

<div class="menubar" >
      <h2>How it works</h2>
</div>

<div class="box" style="padding:20px;min-width:800" >
      <p>
        The plan is to use something like <a href="http://playground.arduino.cc/Interfacing/Scratch">Scratch for Arduino</a> where the 
        webpage either talks to a local server that then
        sends the data to the Arduino or uses Java to communicate directly. It can also do Softbit emulation completely in the webpage and
        not need any hardware. It may be possible to emulate the Synth kit using something like 
        <a href="http://www.g200kg.com/en/docs/webmodular/">WebModular (HTML5+Javascript Modular Synthesizer)</a>. The current plan
        is to be able to snap together softbits on the page and have the <a href="http://arduino.cc">Arduino </a> run them with some feedback
        to the webpage from the Arduino. 
      </p>
</div>

<div class="menubar" >
<h2>Software</h2>
</div>

<div class="box" style="padding:20px;min-width:800" >
<p>
The software is in two parts. The arduino sketch and the server/webpage.
</p>
</div>

<!-- BOttom of page -->
</td><td valign="top">
&nbsp;<br />
<?php
include "../../common/softbits-right.php";
?>

</td></tr>
</table>

<div class="menubar">
&nbsp;<br>
&nbsp;
</div>

