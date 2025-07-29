// Google Analytics – solo en producción
if (location.hostname === 'www.conavre.com' || location.hostname === 'conavre.com') {
  const ga = document.createElement('script');
  ga.src   = 'https://www.googletagmanager.com/gtag/js?id=G-SLX90JRP7G';
  ga.async = true;
  ga.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-SLX90JRP7G');
  };
  document.head.appendChild(ga);
}

// Ocultar indicador de scroll
window.addEventListener('scroll', () =>
  document.body.classList.toggle('scrolled', window.scrollY > 400)
);

document.addEventListener('DOMContentLoaded', () => {

  /* ───────── Menú móvil ───────── */
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () =>
      document.getElementById('nav-principal').classList.toggle('show')
    );
  }

  /* ───────── Lightbox de imágenes ───────── */
  const overlay = Object.assign(document.createElement('div'), { className: 'lightbox-overlay' });
  const img     = document.createElement('img');
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  document.querySelectorAll('.lightbox-trigger').forEach(el =>
    el.addEventListener('click', () => {
      img.src = el.src;
      overlay.style.display = 'flex';
    })
  );
  overlay.addEventListener('click', () => (overlay.style.display = 'none'));

  /* ───────── Animaciones generales ───────── */
  const animables = document.querySelectorAll('.animar-aparicion, .animar-cta');
  const obs = new IntersectionObserver(es =>
    es.forEach(e => e.isIntersecting && e.target.classList.add('animar-activo')), { threshold: 0.2 }
  );
  animables.forEach(el => obs.observe(el));

  const tarjetas = document.querySelectorAll('.animar-tarjeta');
  const obsCards = new IntersectionObserver(es =>
    es.forEach((e, i) => {
      if (e.isIntersecting) setTimeout(() => e.target.classList.add('animar-activo'), i * 100);
    }), { threshold: 0.2 }
  );
  tarjetas.forEach(el => obsCards.observe(el));

  /* ───────── Formulario de cotización ───────── */
  const form  = document.getElementById('form-cotiza');
  const resp  = document.getElementById('respuesta-formulario');
  const texto = document.getElementById('mensaje-texto');
  const close = document.getElementById('cerrar-respuesta');

  form.addEventListener('submit', e => {
    e.preventDefault();

    grecaptcha.ready(() => {
      grecaptcha.execute('6LcuQxcrAAAAALFC3I5dGCo16XAcjz2b58b836TN', { action: 'cotizar' })
        .then(token => {
          document.getElementById('recaptchaResponse').value = token;
          enviarFormulario();
        });
    });
  });

  async function enviarFormulario() {
    resp.style.display = 'block';
    texto.textContent  = '⏳ Enviando solicitud...';

    const datos = new FormData(form);
    let   raw   = null;   // copia de respuesta para debug
    let   r     = null;   // Response object

    try {
      r   = await fetch('/php/enviar-cotizacion.php', { method: 'POST', body: datos });
      raw = await r.clone().text();          // por si el JSON fallase
      const j = JSON.parse(raw);

      texto.innerHTML = r.ok
        ? `✅ <strong>${j.mensaje}</strong>`
        : `❌ ${j.mensaje}`;

      resp.className = r.ok
        ? 'respuesta-form exito fade-in'
        : 'respuesta-form error fade-in';

      if (r.ok) {
        form.reset();
        const pondInst = window.FilePond && FilePond.find(document.getElementById('archivo'));
        if (pondInst) pondInst.removeFiles();
      }

    } catch (err) {
      console.error('Fallo en fetch o JSON:', err);
      if (raw) console.log('Respuesta bruta:', raw);
      texto.textContent = '⚠️ Error al enviar. Intenta más tarde.';
      resp.className    = 'respuesta-form error fade-in';
    }
  }

  close.addEventListener('click', () => (resp.style.display = 'none'));

  /* ───────── FilePond ───────── */
  if (typeof FilePond === 'undefined') {
    console.error('FilePond no se cargó: revisa la ruta o el CDN');
    return; // evitamos ReferenceError posteriores
  }

  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateSize
  );

  FilePond.setOptions({
    allowMultiple: true,
    maxFileSize: '5MB',
    name: 'archivo[]',
    server: false,
    labelIdle: 'Arrastra o <span class="filepond--label-action">explora</span> tus archivos',
    labelMaxFileSizeExceeded: 'El archivo es muy grande',
    labelMaxFileSize: 'Máximo permitido {filesize}'
  });

  // Convierte automáticamente cualquier <input class="filepond">
  FilePond.parse(document.body);
});
