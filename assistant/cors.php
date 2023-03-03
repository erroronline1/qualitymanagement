<?php
$apikey = 'OfenfabrikangebotenGutensohnDorfkonsum';

/*
some servers deny requests from frontend-javascript using fetch.
however this script can be placed on a webserver and loop the request through the server,
ensuring to allow cors for the front end side. make sure to provide a secure apikey to limit abuse
*/
// allow cors
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
// read incoming stream
$payload = json_decode(file_get_contents("php://input"));

// serve preflight request
if ($_SERVER['REQUEST_METHOD']=='OPTIONS'){
	header("HTTP/1.1 200 OK");
	exit;
}

// request and return
if ($_SERVER['REQUEST_METHOD']=='POST' && $payload->apikey == $apikey){
	$src = file_get_contents($payload->url);
	if (strlen($src) > 0) echo $src;
	else echo http_response_code(204);
}
else echo http_response_code(405);
?>