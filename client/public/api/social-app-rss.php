<?php
header('Access-Control-Allow-Origin: *');

header('Access-Control-Allow-Methods: GET, POST');

header("Access-Control-Allow-Headers: X-Requested-With");


//get the q parameter from URL

$q=$_GET["q"];

$xmlDoc = new DOMDocument();

$xmlDoc->load($q);



$stack = array();

$x=$xmlDoc->getElementsByTagName('item');



for ($i=0; $i< $x->length; $i++) {



  $item_title=$x->item($i)->getElementsByTagName('title')
  ->item(0)->childNodes->item(0)->nodeValue;

  $item_link=$x->item($i)->getElementsByTagName('link')
  ->item(0)->childNodes->item(0)->nodeValue;

  $item_desc=$x->item($i)->getElementsByTagName('description')
  ->item(0)->childNodes->item(0)->nodeValue;
  
    $item_pubDate=$x->item($i)->getElementsByTagName('pubDate')
  ->item(0)->childNodes->item(0)->nodeValue;
  
    $item_guid=$x->item($i)->getElementsByTagName('guid')
  ->item(0)->childNodes->item(0)->nodeValue;

array_push($stack, ['title' => $item_title, 'link' => $item_link, 'description' => $item_desc, 'pubDate' => $item_pubDate, 'guid' => $item_guid]);



}

echo json_encode($stack);


?>