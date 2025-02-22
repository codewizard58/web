<?php
  // 11/16/24
  // 11/24/24
  
  $port = "";
  $nonet = 0;
  $loaddata="";
  
  $action = "";
  if( isset($_POST['action'] )) {
    $action= $_POST['action'];
  }

  if( $action == "" && isset($_GET['action'] )){
    $action= "get_".$_GET['action'];
  }

  if( isset($_POST['savedata']) ){
	  $data = $_POST['savedata'];
	  header("Content-type: application/x-sbl");
	  header("Content-disposition: application; filename=saved.sbl");
	  echo $data;
    die("");
  }
  
  if( $action == "Load"){
      $updir ="/tmp/";
      if( !is_dir( $updir) ){
        mkdir($updir);
      }
      $lname = $updir.md5( $_FILES["loadfilename"]["name"].date('D=d+M Y H:i:s') ).".sbl";

      if( ! move_uploaded_file($_FILES["loadfilename"]["tmp_name"], $lname) ) {
        echo "<p>Load file data to $lname failed!</p>\n";
        die("");
      }
      
      $code = fopen($lname, "rb");
      if( $code !== false){
        
        while( ($buf = fgets($code, 1024) ) !== false ){
          $loaddata = $loaddata.$buf;  
        }
      
        fclose($code);
        
        unlink( $lname);
        
      }else {
        echo "<p>Couild not open $lname for reading</p>";
        die("");
      }
      $action="";
  }
  if( $action == "New" || $action == "get_New" ){
    $action= "";
    $loaddata="";
  }

  if( $action != ""){
     if( $action == "code"){
       die("");

    }else if( $action == "noteon"){
      $note = $_POST['note'];
      $vel = $_POST['vel'];
      
      die("");
      echo "noteon($note, $vel)";
     
      if( $note >= 48 && $note <= 68){     
        if( $vel == 0){
          // note off
          $data[0] = 0x80;
          $vel = 0;
        }else {
          $data[0] = 0x90;
        }
        $data[1] = $note;
        $data[2] = $vel;
        
        
        $senddata = implode( array_map( "chr", $data) );

        $com7 = stream_socket_client("tcp://192.168.0.80:5331", $errno, $errstr, 30);
        if (!$com7) {
          echo "$errstr ($errno)<br />\n";
        } else {
            fwrite($com7, $senddata);
            fpassthru($com7);
            fclose($com7);
        }
      }
      die("");
    }
    echo "Action=$action";
  
    die("");
  }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
  <title>Softbits Live 2024.1124</title>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=no'>
  <meta name='mobile-web-app-capable' content='yes'>
  <meta name='apple-mobile-web-app-capable' content='yes'>
</head>
  
<body onload="sketchinit();">
  <style>
    .box { border-style: solid;
      border-width: 2px;
      border-color: red;
    }
  </style>
  <script  type="text/javascript">
  <?php include "softbitsglobals.js"; ?>
  </script>
  <script type="text/javascript">
  <?php include "softbitsctrls.js" ; ?>
  </script>
  <?php
    if( is_dir("ctrls")){
      $dir = new DirectoryIterator("ctrls");
      foreach ($dir as $fileinfo) {
        if (!$fileinfo->isDot()) {
          echo("<script type=\"text/javascript\" >\n");
          echo("// filename=".$fileinfo->getPathname()."\n");
          include($fileinfo->getPathname());
          echo("</script>\n");
        }
      }
    }
  ?>
  <?php
    if( is_dir("kits")){
      $dir = new DirectoryIterator("kits");
      foreach ($dir as $fileinfo) {
        if (!$fileinfo->isDot()) {
          echo("<script type=\"text/javascript\" >\n");
          echo("// filename=".$fileinfo->getPathname()."\n");
          include($fileinfo->getPathname());
          echo("</script>\n");
        }
      }
    }
  ?>
  <script type="text/javascript">
  <?php include "softbitslive.js"; ?>
  </script>
  <?php
    if( is_file("header.php") ){
      echo ("<div id='headerdiv' >\n");
      include "header.php";
      echo("</div>\n");
    }
  ?>

  <div>
    <input type="button" id="abouttab" value="About" onclick="UIshowabout();" />
    <input type="button" id="progtab" value="Prog" onclick="UIshowprog();" style="background-Color: green;color: white;"/>
    <input type="button" id="playtab" value="Play" onclick="UIshowplay();" />

    <div id="aboutdiv" style="display:none;" >

      <?php
      if( is_file("bodytext.php") ){
        echo ("<div id='bodydiv' >\n");
        include "bodytext.php";
        echo("</div>\n");
      }
      ?>
      
      <?php
      if( is_file("footer.php") ){
        echo ("<div id='footerdiv' >\n");
        include "footer.php";
        echo ("</div>\n");
      }
    ?>
    </div>
    <?php
    echo "<script type='text/javascript'>\n";
    echo "var initdataonLoad= [\n";
    if( $loaddata == ""){
      $loaddata = "12,'bit',1,'power_on',0,245,319,0,0,0,0,  1,
      12,'bit',2,'power_off',16,426,319,0,0,0,0,  1,
      ";
    }
    echo $loaddata;
    echo "2,'end',\n";
    echo "0\n";
    echo "];\n";
    
    echo "var initdataonReset= [\n";
      $loaddata = "12,'bit',1,'power_on',0,245,319,0,0,0,0,  1,
      12,'bit',2,'power_off',16,426,319,0,0,0,0,  1,
      6,'options',1,1,1,1,
      ";
    echo $loaddata;
    echo "2,'end',\n";
    echo "0\n";
    echo "];\n";
    
    if( is_file("resources/imagemap.txt") ){
      echo ("var imagemapdata = [\n");
      include("resources/imagemap.txt");
      echo ("];\n");
    }
    echo "</script>\n";
    ?>
    <div id="progdiv" >
      <table>
        <tr>
          <td valign="top">
            <div id="canvasbox" ondrop="UIondrop(event);" ondragover="UIondragover(event);">
              <canvas width ="1024" height="768" tabindex="1" id="canvas"  >
              </canvas>
            </div>
          </td>
          <td valign="top">
            <div style="padding:20px;">
              <span class="box" style="padding:10px;border-color:green;">
                <input type="button" id="loadbutton" value="Load" onclick="UIdoLoad()"></input>
                <input type="button" id="savebutton" value="Save" onclick="UIdoSave()"></input>
                <input type="button" value="New" onclick="UIdoNew()"></input>
                <input type="button" value="Reload" onclick="UIdoReload()"></input>
              </span>
            </div>
            <div style="padding:20px; display: none;" id="transport_controls" >
              <span class="box" style="padding:10px;border-color:red;">
                <input type="button" id="runbutton" value="Run" onclick="UItransport(2)"></input>
                <input type="button" id="pausebutton" value="Pause" onclick="UItransport(1)"></input>
                <input type="button" id="stopbutton" value="Stop" onclick="UItransport(0)"></input>
              </span>
            </div>
            <table>
              <tr>
                <td colspan="3">
                  <div id="bitprops">
                    <form id="bitform">
                    </form>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="4" id="showbittype" >Basic/Power</td>
              </tr>
              <tr>
                <td valign="top" rowspan="2">
                    <div id="addbitdiv" style="width:100px;border-color:grey; border-width:2px; border-style:solid;">
                      Select bit type to populate list then click to add.
                    </div>
                    <p>&nbsp;</p>
                </td>
                <td valign="top">
                  <div  >
                    <div class="power" style="width:75px;height:25px;border-color:blue; border-width:10px; border-style:solid;cursor:pointer;" onclick="UIchoosePower();"> Power </div>
                    <div class="input" style="width:75px;height:25px;border-color:purple; border-width:10px; border-style:solid;cursor:pointer;" onclick="UIchooseInput();"> Input </div>
                    <div class="output" style="width:75px;height:25px;border-color:green; border-width:10px; border-style:solid;cursor:pointer;" onclick="UIchooseOutput();"> Output </div>
                    <div class="wire" style="width:75px;height:25px;border-color:orange; border-width:10px; border-style:solid;cursor:pointer;" onclick="UIchooseWire();"> Wire </div>
                    <div class="action" style="width:75px;height:25px;border-color:red; border-width:10px; border-style:solid;cursor:pointer;" onclick="UIchooseAction();"> Action </div>
                    <div class="logic" style="width:75px;height:25px;border-color:black; border-width:10px; border-style:solid;cursor:pointer;" onclick="UIchooseLogic();"> Logic </div>
                  </div>
                </td>
                <?php if( is_dir("kits")){
                    echo('<td valign="top">');
                    $dir = new DirectoryIterator("kits");
                    // show Basic first
                    echo('<div  style="width:75px;height:25px;border-color:green; border-width:10px; border-style:solid;cursor:pointer;" onclick="UIchooseKit_clicked(\''."Basic".'\');"> Kit '."Basic"."</div>\n");
                    foreach ($dir as $fileinfo) {
                      if (!$fileinfo->isDot()) {
                        echo("<!-- filename=".$fileinfo->getPathname()." -->\n");
                        $xid = explode(".", $fileinfo->getFilename());
                        $kid = explode("_", $xid[0]);
                        if( $kid[1] != "Basic"){
                          echo('<div  style="width:75px;height:25px;border-color:green; border-width:10px; border-style:solid;cursor:pointer;" onclick="UIchooseKit_clicked(\''.$kid[1].'\');"> Kit '.$kid[1]."</div>\n");
                        }
                      }
                    }
                    echo('</td>');
                  }
                ?>
              </tr>
              <tr><td colspan="2">
                  <div style="padding:5px;" id="programdiv">
                    <div class="box" style="border-color:green;" id="program"></div>
                  </div>
                  <div style="padding:5px;" id="codediv">
                    <div class="box" style="border-color:blue;" id="code">
                      Code display in hex
                    </div>
                  </div>

                </td>
                </tr>
            </table>
          </td>
          <td valign='top'>
            <?php
            $infodir = "resources/info";
            if( is_dir($infodir)){
              echo("<div id='info'>\n");
              $dir = new DirectoryIterator($infodir);
              foreach ($dir as $fileinfo) {
                if (!$fileinfo->isDot()) {
                  include($fileinfo->getPathname());
                }
              }
              echo("</div>\n");
            }
            ?>
          </td>
        </tr>
      </table>
      <hr />
      <div id="options">
          <span>Show Chains:</span>
          <input type="checkbox" id="showchains" onchange="UIdoShowChains()" checked="checked"/>
          <span>Show Program:</span>
          <input type="checkbox" id="showprogram" onchange="UIdoShowProgram()" checked="checked"/>
          <span>Show Code:</span>
          <input type="checkbox" id="showcode" onchange="UIdoShowCode()" checked="checked"/>
          <span>Show Snaps:</span>
          <input type="checkbox" id="showsnaps" onchange="UIshowsnaps()" checked="checked"/>
      </div>
    </div> <!-- end of progdiv -->
    <div id="playdiv" style="display:none;">
      <p>Play area</p>

      <table>
          <tr>
            <td valign="top">
              <div id="playbox">
                  <canvas width ="800" height="600" tabindex="2" id="playcanvas">
                  </canvas>
                  <video id='video' style='display:none'>
                  </video >
                  <canvas width ="800" height="600" tabindex="2" id="videocanvas"  style='display:none'>
                  </canvas>
                  <canvas width ="400" height="400" tabindex="2" id="playercanvas"  >
                  </canvas>
                </div>
            </td>
          </tr>
      </table>
    </div>
    <div id="logger" class="box" style="padding:10px;border-color:blue;">
        Version 1.1
    </div>
    <div id="debugdiv">
      <input type="button" value="Debug" onclick="UIsettrace();" ></input>
      <input type="button" value="Imagemap" onclick="UIimagemap();" ></input>

      <div id="debugmsg">Debug messages<br />
      </div>
    </div>
    <form id="saveform" method="post" action="softbitslive.php">
      <textarea id="savedata" name="savedata" style="display:none"></textarea>
    </form>
  </div>
  <div style="display:none;">
      <img src="background.png" id="background" />
      <img src="up.png" id="up" />
      <img src="down.png" id="down" />
      <img src="resources/imagemap.png" id="imagemap">
  </div>

  </body>
</html>
