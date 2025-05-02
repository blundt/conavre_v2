document.getElementById("menu-toggle").addEventListener("click", function () {
    document.getElementById("nav-principal").classList.toggle("show");
  });
  
// LIGHTBOX sencillo
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  document.body.appendChild(overlay);

  const img = document.createElement('img');
  overlay.appendChild(img);

  document.querySelectorAll('.lightbox-trigger').forEach(image => {
    image.addEventListener('click', () => {
      img.src = image.src;
      overlay.style.display = 'flex';
    });
  });

  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
});

// Animar cuando los elementos entran en pantalla
document.addEventListener('DOMContentLoaded', function () {
  const animaciones = document.querySelectorAll('.animar-aparicion, .animar-cta');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animar-activo');
      }
    });
  }, {
    threshold: 0.2 // 20% del elemento debe ser visible
  });

  animaciones.forEach(el => observer.observe(el));
});

// Animar tarjetas secuencialmente al entrar en pantalla
document.addEventListener('DOMContentLoaded', function () {
  const tarjetas = document.querySelectorAll('.animar-tarjeta');

  const observerTarjetas = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animar-activo');
        }, index * 100); // delay de 100ms entre cada tarjeta
      }
    });
  }, {
    threshold: 0.2
  });

  tarjetas.forEach(el => observerTarjetas.observe(el));
});

window.addEventListener('scroll', function () {
  if (window.scrollY > 400) { // antes era 50
    document.body.classList.add('scrolled');
  } else {
    document.body.classList.remove('scrolled');
  }
});



document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("form-cotiza");
  const respuesta = document.getElementById("respuesta-formulario");
  const mensajeTexto = document.getElementById("mensaje-texto");
  const cerrarBtn = document.getElementById("cerrar-respuesta");

  if (!formulario || !respuesta || !mensajeTexto || !cerrarBtn) return;

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    respuesta.style.display = "block";
    respuesta.style.opacity = 0;
    mensajeTexto.innerHTML = "⏳ Enviando solicitud...";
    mensajeTexto.style.color = "#444";

    const datos = new FormData(formulario);

    try {
      const respuestaServidor = await fetch("php/enviar-cotizacion.php", {
        method: "POST",
        body: datos,
      });

      const resultado = await respuestaServidor.json();

      respuesta.classList.remove("exito", "error");

      if (respuestaServidor.ok) {
        mensajeTexto.innerHTML = `✅ <strong>${resultado.mensaje}</strong>`;
        mensajeTexto.style.color = "#155724";
        respuesta.classList.add("exito");
        formulario.reset();

        // Resetear FilePond visualmente
        const pond = FilePond.find(document.getElementById("archivo"));
        if (pond) pond.removeFiles();
      } else {
        mensajeTexto.innerHTML = `❌ ${resultado.mensaje}`;
        mensajeTexto.style.color = "#721c24";
        respuesta.classList.add("error");
      }
    } catch (error) {
      mensajeTexto.innerHTML = "⚠️ Error al enviar. Intenta más tarde.";
      mensajeTexto.style.color = "red";
    }

    respuesta.classList.remove("fade-in");
    void respuesta.offsetWidth;
    respuesta.classList.add("fade-in");
  });

  cerrarBtn.addEventListener("click", () => {
    respuesta.style.display = "none";
    mensajeTexto.innerHTML = "";
    respuesta.classList.remove("exito", "error");
  });
});

// Registrar plugins necesarios
FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize
);

// Inicializar FilePond en el input
FilePond.create(document.getElementById("archivo"), {
  allowMultiple: true,
  maxFileSize: "5MB",
  labelIdle: `Arrastra o <span class="filepond--label-action">explora</span> tus archivos`,
  labelMaxFileSizeExceeded: "El archivo es muy grande",
  labelMaxFileSize: "Máximo permitido es {filesize}",
  labelFileLoading: "Cargando...",
  labelFileProcessing: "Subiendo...",
  labelFileRemoveError: "Error al eliminar",
  labelTapToCancel: "Toca para cancelar",
  labelTapToRetry: "Toca para reintentar",
  labelTapToUndo: "Toca para deshacer",
  labelButtonRemoveItem: "Eliminar",
  labelButtonAbortItemLoad: "Cancelar",
  labelButtonRetryItemLoad: "Reintentar",
  labelButtonAbortItemProcessing: "Cancelar",
  labelButtonUndoItemProcessing: "Deshacer",
  labelButtonRetryItemProcessing: "Reintentar",
  labelButtonProcessItem: "Subir",
});

if (location.hostname === 'www.conavre.com' || location.hostname === 'conavre.com') {
  const gaScript = document.createElement('script');
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-SLX90JRP7G';
  gaScript.async = true;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }

  gtag('js', new Date());
  gtag('config', 'G-SLX90JRP7G');
}



