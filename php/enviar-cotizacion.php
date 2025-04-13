<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // --- 1. Honeypot anti-bot ---
    if (!empty($_POST['honeypot'])) {
        echo "<script>alert('Error: Actividad sospechosa detectada.'); history.back();</script>";
        exit;
    }

    // --- 2. Verificación reCAPTCHA ---
    $recaptcha_secret = '6LcuQxcrAAAAAFhF3hKt7frLi7BTgzpX98sLXBFR';
    $recaptcha_response = $_POST['recaptcha_response'];

    $verify_response = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret='.$recaptcha_secret.'&response='.$recaptcha_response);
    $response_data = json_decode($verify_response);

    if (!$response_data->success || $response_data->score < 0.5) {
        echo "<script>alert('Error: Verificación de seguridad fallida. Intenta nuevamente.'); history.back();</script>";
        exit;
    }

    // --- 3. Procesar el formulario ---
    $nombre = htmlspecialchars($_POST['nombre']);
    $correo = htmlspecialchars($_POST['email']);
    $telefono = htmlspecialchars($_POST['telefono']);
    $tipo = htmlspecialchars($_POST['tipo']);
    $descripcion = htmlspecialchars($_POST['descripcion']);

    $to = "contacto@conavre.com";
    $subject = "Nueva solicitud de cotización desde el sitio web";

    $message = "Has recibido una nueva solicitud de cotización:\n\n";
    $message .= "Nombre: $nombre\n";
    $message .= "Correo: $correo\n";
    $message .= "Teléfono: $telefono\n";
    $message .= "Tipo de proyecto: $tipo\n\n";
    $message .= "Descripción:\n$descripcion\n";

    $headers = "From: $correo";

    if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] == UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['archivo']['tmp_name'];
        $fileName = $_FILES['archivo']['name'];
        $fileType = $_FILES['archivo']['type'];
        $fileContent = chunk_split(base64_encode(file_get_contents($fileTmpPath)));

        $boundary = md5(time());
        $headers .= "\nMIME-Version: 1.0\n";
        $headers .= "Content-Type: multipart/mixed; boundary=\"".$boundary."\"";

        $body = "--$boundary\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\n";
        $body .= "Content-Transfer-Encoding: 7bit\n\n";
        $body .= "$message\n\n";

        $body .= "--$boundary\n";
        $body .= "Content-Type: $fileType; name=\"$fileName\"\n";
        $body .= "Content-Disposition: attachment; filename=\"$fileName\"\n";
        $body .= "Content-Transfer-Encoding: base64\n\n";
        $body .= "$fileContent\n";
        $body .= "--$boundary--";

        $success = mail($to, $subject, $body, $headers);
    } else {
        $success = mail($to, $subject, $message, $headers);
    }

    if ($success) {
        echo "<script>alert('¡Gracias! Tu solicitud fue enviada con éxito.'); window.location.href = '../index.html';</script>";
    } else {
        echo "<script>alert('Hubo un error al enviar tu solicitud. Intenta nuevamente.'); history.back();</script>";
    }
}
?>
