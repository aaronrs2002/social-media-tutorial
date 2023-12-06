

<?php
ini_set ('display_errors',1);

error_reporting (E_ALL & ~ E_NOTICE);
/*
START RANDOM ID
*/
function guidv4()
{
    if (function_exists('com_create_guid') === true)
        return trim(com_create_guid(), '{}');

    $data = openssl_random_pseudo_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}
/*
END RANDOM ID
*/


  $email=$_POST['email'];
$uuid = guidv4();
$timestamp = $_POST['timestamp'];
  $url = 'http://localhost:3000/';

  $subject = 'Confirm email address from social media app';

  $mailcontent = 'Greetings: '.$email."\n"

."To confirm you would like to create an account with the social media app, click here ".$url."?uuid=".$uuid."&timestamp=".$timestamp." \n"

."This has a 10 minute time limit. \n"

.'If you are not trying to create an account, please ingore this email.';


  mail($email, $subject, $mailcontent);





$inp = file_get_contents('list.json');
$add = json_encode($arr);
$tempArray = json_decode($inp);
array_push($tempArray, $uuid);
$jsonData = json_encode($tempArray);
file_put_contents('list.json', $jsonData);

?>
<html>
<head>
<title>web-presence.biz</title>
<style>
body {
    background-color:#fff;
	font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
	font-size:13px;
	color:#000;
	line-height:20px;
	text-align:center;
}
h1, a:link, a:hover, a:active, a:visited {
	font-size:15px;
	font-weight:bold;
	color:#000;
	text-align:center;
}
#noteWrapper {
	width:100%;
}
#noteBack {
	width:300px;
	margin: 0 auto 0 auto;
}
#logo {
	width:291px;
	margin: 0 auto 0 auto;
}
</style>
</head>
<body>
<div id="noteWrapper">
  <div id="noteBack">
    <?php

ini_set ('display_errors',1);

error_reporting (E_ALL & ~ E_NOTICE);

print "<p>To log in, check your email at:  <br/><strong> ".$email." </strong>.</p>"; 


print "<input type='hidden' value=".$url." id='urlAddress' />";

?>
    

  </div>
</div>
<!--end wrapper-->


<script type="text/javascript">
var url = document.getElementById("urlAddress").value;

setTimeout(function(){ 
	window.location.href =  url;
}, 30000);
</script>
</body>
</html>
