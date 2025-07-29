<?php
/* ───────── Configuración ───────── */
$destino  = "contacto@conavre.com";
$asunto   = "Nueva solicitud de cotización desde CONAVRE";
$limite_archivo         = 5 * 1024 * 1024;                     // 5 MB
$extensiones_permitidas = ['jpg','jpeg','png','gif','pdf'];

/* OPCIONAL: no mostrar avisos PHP al visitante */
ini_set('display_errors', 0);

/* ───────── Función respuesta JSON ───────── */
function responder($mensaje, $codigo = 200) {
    http_response_code($codigo);
    header('Content-Type: application/json');
    echo json_encode(['mensaje' => $mensaje]);
    exit;
}

/* Honeypot */
if (!empty($_POST['honeypot'])) {
    responder("Spam detectado", 403);
}

/* Campos requeridos */
if (
    empty($_POST['nombre']) ||
    empty($_POST['email'])  ||
    empty($_POST['tipo'])   ||
    empty($_POST['descripcion']) ||
    empty($_POST['recaptcha_response'])
) {
    responder("Faltan datos obligatorios.", 400);
}

/* Sanitización */
$nombre      = htmlspecialchars(strip_tags($_POST['nombre']));
$email       = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$telefono    = htmlspecialchars(strip_tags($_POST['telefono'] ?? ''));
$tipo        = htmlspecialchars(strip_tags($_POST['tipo']));
$descripcion = htmlspecialchars(strip_tags($_POST['descripcion']));

/* Validación de email */
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder("Correo electrónico no válido.", 400);
}

/* ───────── Verificar reCAPTCHA ───────── */
$recaptcha = $_POST['recaptcha_response'];
$secret    = '6LcuQxcrAAAAAFhF3hKt7frLi7BTgzpX98sLXBFR';

$verify  = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secret&response=$recaptcha");
$captcha = json_decode($verify);

$umbral = 0.30;
if (!$captcha->success)               responder("Verificación reCAPTCHA fallida.", 403);
if ($captcha->action !== 'cotizar')   responder("Acción reCAPTCHA no coincide.",   403);
if ($captcha->score  < $umbral)       responder("Score bajo de reCAPTCHA ({$captcha->score}).", 403);

/* ───────── Cuerpo del mensaje ───────── */
$mensaje  = "Nueva solicitud de cotización desde CONAVRE:\n\n";
$mensaje .= "Nombre: $nombre\n";
$mensaje .= "Correo: $email\n";
$mensaje .= "Teléfono: $telefono\n";
$mensaje .= "Tipo de Proyecto: $tipo\n";
$mensaje .= "Descripción:\n$descripcion\n";

/* ───────── Adjuntos (opcional) ───────── */
$boundary = "_Parte_" . md5(uniqid());   // mismo boundary para todo
$adjunto  = '';

if (isset($_FILES['archivo']) && $_FILES['archivo']['error'][0] !== UPLOAD_ERR_NO_FILE) {

    $total = count($_FILES['archivo']['name']);

    for ($i = 0; $i < $total; $i++) {
        if ($_FILES['archivo']['error'][$i] === UPLOAD_ERR_OK) {

            $nombre_original = basename($_FILES['archivo']['name'][$i]);
            $extension       = strtolower(pathinfo($nombre_original, PATHINFO_EXTENSION));
            $archivo_temp    = $_FILES['archivo']['tmp_name'][$i];
            $archivo_size    = $_FILES['archivo']['size'][$i];

            /* Validaciones */
            if (!in_array($extension, $extensiones_permitidas)) {
                responder("Tipo de archivo no permitido: $nombre_original", 400);
            }
            if ($archivo_size > $limite_archivo) {
                responder("El archivo '$nombre_original' supera los 5 MB permitidos.", 400);
            }

            $tipo_mime      = mime_content_type($archivo_temp);
            $contenido      = chunk_split(base64_encode(file_get_contents($archivo_temp)));
            $nombre_archivo = time()."_$i_".preg_replace('/[^a-zA-Z0-9._-]/','',$nombre_original);

            /* Fragmento MIME para cada adjunto */
            $adjunto .= "--$boundary\r\n";
            $adjunto .= "Content-Type: $tipo_mime; name=\"$nombre_archivo\"\r\n";
            $adjunto .= "Content-Transfer-Encoding: base64\r\n";
            $adjunto .= "Content-Disposition: attachment; filename=\"$nombre_archivo\"\r\n\r\n";
            $adjunto .= $contenido . "\r\n";
        }
    }
}

/* ───────── Encabezados y cuerpo final ───────── */
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "From: $nombre <$email>\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

$cuerpo  = "--$boundary\r\n";
$cuerpo .= "Content-Type: text/plain; charset=UTF-8\r\n";
$cuerpo .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$cuerpo .= $mensaje . "\r\n";

if ($adjunto) $cuerpo .= $adjunto;

$cuerpo .= "--$boundary--\r\n";

/* ───────── Enviar correo ───────── */
if (mail($destino, $asunto, $cuerpo, $headers)) {
    responder("Cotización enviada correctamente.");
} else {
    responder("Error al enviar el correo. Intente más tarde.", 500);
}
?>
