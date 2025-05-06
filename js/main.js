// Google Analytics solo en producción
if (location.hostname === 'www.conavre.com' || location.hostname === 'conavre.com') {
  const gaScript = document.createElement('script');
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-SLX90JRP7G';
  gaScript.async = true;

  gaScript.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }

    gtag('js', new Date());
    gtag('config', 'G-SLX90JRP7G');
  };

  document.head.appendChild(gaScript);
}

// Scroll detectado (para ocultar scroll-indicator)
window.addEventListener('scroll', function () {
  if (window.scrollY > 400) {
    document.body.classList.add('scrolled');
  } else {
    document.body.classList.remove('scrolled');
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Menú móvil toggle
  const menuToggle = document.getElementById("menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      document.getElementById("nav-principal").classList.toggle("show");
    });
  }

  // Lightbox para imágenes
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  const img = document.createElement('img');
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  document.querySelectorAll('.lightbox-trigger').forEach(image => {
    image.addEventListener('click', () => {
      img.src = image.src;
      overlay.style.display = 'flex';
    });
  });

  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  // Animaciones generales al hacer scroll (cta y aparición)
  const animaciones = document.querySelectorAll('.animar-aparicion, .animar-cta');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animar-activo');
      }
    });
  }, { threshold: 0.2 });
  animaciones.forEach(el => observer.observe(el));

  // Animaciones de tarjetas
  const tarjetas = document.querySelectorAll('.animar-tarjeta');
  const observerTarjetas = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animar-activo');
        }, index * 100);
      }
    });
  }, { threshold: 0.2 });
  tarjetas.forEach(el => observerTarjetas.observe(el));

  // Lógica del formulario de cotización
  const formulario = document.getElementById("form-cotiza");
  const respuesta = document.getElementById("respuesta-formulario");
  const mensajeTexto = document.getElementById("mensaje-texto");
  const cerrarBtn = document.getElementById("cerrar-respuesta");

  if (formulario && respuesta && mensajeTexto && cerrarBtn) {
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
  }

  // FilePond inicialización y configuración
  if (window.FilePond) {
    FilePond.registerPlugin(
      FilePondPluginImagePreview,
      FilePondPluginFileValidateSize
    );

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
  }
});
