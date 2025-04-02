<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = htmlspecialchars($_POST['nombre']);
    $correo = htmlspecialchars($_POST['correo']);
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

    // Manejo de archivo adjunto
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
} else {
    echo "<script>window.location.href = '../index.html';</script>";
}
?>
