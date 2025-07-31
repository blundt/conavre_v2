<?php
/* ───────── Configuración ───────── */
$destino  = 'contacto@conavre.com';
$asunto   = 'Nueva solicitud de cotización desde CONAVRE';
$secret   = '6LcuQxcrAAAAAFhF3hKt7frLi7BTgzpX98sLXBFR';   // SECRET KEY v3

$max_size = 5 * 1024 * 1024;               // 5 MB
$permitidas = ['jpg','jpeg','png','gif','pdf'];

/* ───────── Utilidades ───────── */
function responder($msg, $code=200){
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['mensaje'=>$msg]);
    exit;
}

/* ───────── Debug opcional ───────── */
ini_set('display_errors', 0);              // no mostrar notices al usuario
if (isset($_POST['modo_debug'])) {
    responder($_FILES);                    // inspeccionar y salir
}

/* ───────── Honeypot ───────── */
if (!empty($_POST['honeypot'])) responder('Spam detectado',403);

/* ───────── Campos obligatorios ───────── */
foreach (['nombre','email','tipo','descripcion','recaptcha_response'] as $c){
    if (empty($_POST[$c])) responder('Faltan datos obligatorios',400);
}

/* ───────── Sanitizar / validar ───────── */
$nombre   = htmlspecialchars(strip_tags($_POST['nombre']));
$email    = filter_var($_POST['email'],FILTER_SANITIZE_EMAIL);
if (!filter_var($email,FILTER_VALIDATE_EMAIL)) responder('Correo inválido',400);

$telefono = htmlspecialchars(strip_tags($_POST['telefono']??''));
$tipo     = htmlspecialchars(strip_tags($_POST['tipo']));
$desc     = htmlspecialchars(strip_tags($_POST['descripcion']));

/* ───────── reCAPTCHA v3 ───────── */
$token = $_POST['recaptcha_response'];
$resp  = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secret&response=$token");
$rec   = json_decode($resp, true);

if (!$rec['success']            ||
     $rec['action']!=='cotizar' ||
     $rec['score'] < 0.3) responder('Fallo reCAPTCHA',403);

/* ───────── Cuerpo de texto ───────── */
$msg  = "Nueva solicitud de cotización:\n\n";
$msg .= "Nombre: $nombre\nCorreo: $email\nTeléfono: $telefono\n";
$msg .= "Tipo de proyecto: $tipo\n\nDescripción:\n$desc\n";

/* ───────── Adjuntos ───────── */
$boundary = '_'.md5(uniqid());
$adjuntos = '';

if (isset($_FILES['archivo']) && $_FILES['archivo']['error'][0]!==UPLOAD_ERR_NO_FILE){
    $n = count($_FILES['archivo']['name']);

    for ($i=0;$i<$n;$i++){
        if ($_FILES['archivo']['error'][$i]!==UPLOAD_ERR_OK) continue;

        $name = basename($_FILES['archivo']['name'][$i]);
        $tmp  = $_FILES['archivo']['tmp_name'][$i];
        $size = $_FILES['archivo']['size'][$i];
        $ext  = strtolower(pathinfo($name,PATHINFO_EXTENSION));

        if (!in_array($ext,$permitidas)) responder("Extensión no permitida ($name)",400);
        if ($size>$max_size)              responder("Archivo '$name' supera 5 MB",400);

        $data = chunk_split(base64_encode(file_get_contents($tmp)));
        $mime = mime_content_type($tmp);

        $adjuntos .= "--$boundary\r\n";
        $adjuntos .= "Content-Type: $mime; name=\"$name\"\r\n";
        $adjuntos .= "Content-Transfer-Encoding: base64\r\n";
        $adjuntos .= "Content-Disposition: attachment; filename=\"$name\"\r\n\r\n";
        $adjuntos .= $data."\r\n";
    }
}

/* ───────── Encabezados + cuerpo MIME ───────── */
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "From: $nombre <$email>\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

$cuerpo  = "--$boundary\r\n";
$cuerpo .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
$cuerpo .= $msg."\r\n";
if ($adjuntos) $cuerpo .= $adjuntos;
$cuerpo .= "--$boundary--";

/* ───────── Enviar ───────── */
if (mail($destino,$asunto,$cuerpo,$headers))
     responder('Cotización enviada correctamente.');
else responder('Error al enviar el correo',500);
?>
