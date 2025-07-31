/* Google Analytics – solo en producción */
if (['www.conavre.com','conavre.com'].includes(location.hostname)) {
  const ga = document.createElement('script');
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-SLX90JRP7G';
  ga.async = true;
  ga.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-SLX90JRP7G');
  };
  document.head.appendChild(ga);
}

/* Ocultar indicador scroll */
addEventListener('scroll', () =>
  document.body.classList.toggle('scrolled', scrollY > 400)
);

document.addEventListener('DOMContentLoaded', () => {

  /* ───── Menú móvil ───── */
  const menuBtn = document.getElementById('menu-toggle');
  menuBtn?.addEventListener('click', () =>
    document.getElementById('nav-principal')?.classList.toggle('show')
  );

  /* ───── Lightbox ───── */
  const overlay = Object.assign(document.createElement('div'), {className:'lightbox-overlay'});
  const imgBig  = document.createElement('img');
  overlay.appendChild(imgBig);
  document.body.appendChild(overlay);

  document.querySelectorAll('.lightbox-trigger').forEach(el =>
    el.addEventListener('click', () => {
      imgBig.src = el.src;
      overlay.style.display = 'flex';
    })
  );
  overlay.addEventListener('click', () => overlay.style.display = 'none');

  /* ───── Animaciones en scroll ───── */
  const animables = document.querySelectorAll('.animar-aparicion, .animar-cta');
  new IntersectionObserver(ent =>
    ent.forEach(e => e.isIntersecting && e.target.classList.add('animar-activo')), {threshold:0.2}
  ).observeAll?.(animables) ?? animables.forEach(el=>obs.observe(el)); // Safari fallback

  const tarjetas = document.querySelectorAll('.animar-tarjeta');
  new IntersectionObserver(ent =>
    ent.forEach((e,i)=>e.isIntersecting&&setTimeout(()=>e.target.classList.add('animar-activo'),i*100)),
    {threshold:0.2}
  ).observeAll?.(tarjetas) ?? tarjetas.forEach(el=>obsT.observe(el));

  /* ───── Formulario ───── */
  const form   = document.getElementById('form-cotiza');
  const resp   = document.getElementById('respuesta-formulario');
  const texto  = document.getElementById('mensaje-texto');
  const cerrar = document.getElementById('cerrar-respuesta');

  form.addEventListener('submit', e => {
    e.preventDefault();
    grecaptcha.ready(() => {
      grecaptcha.execute('6LcuQxcrAAAAALFC3I5dGCo16XAcjz2b58b836TN', {action:'cotizar'})
        .then(token => {
          document.getElementById('recaptchaResponse').value = token;
          enviar();
        });
    });
  });

  async function enviar(){
    resp.style.display = 'block';
    texto.textContent  = '⏳ Enviando solicitud…';

    const datos = new FormData(form);            // incluye archivos
    try{
      const r  = await fetch('/php/enviar-cotizacion.php',{method:'POST',body:datos});
      const j  = await r.json();

      texto.innerHTML = r.ok
        ? `✅ <strong>${j.mensaje}</strong>`
        : `❌ ${j.mensaje}`;

      resp.className = r.ok ? 'respuesta-form exito fade-in'
                            : 'respuesta-form error fade-in';

      if (r.ok){
        form.reset();
        FilePond.find(document.getElementById('archivo'))?.removeFiles();
      }
    }catch(err){
      console.error(err);
      texto.textContent = '⚠️ Error al enviar. Intenta más tarde.';
      resp.className    = 'respuesta-form error fade-in';
    }
  }

  cerrar.addEventListener('click', ()=> resp.style.display='none');

  /* ───── FilePond ───── */
  if (typeof FilePond==='undefined'){
    console.error('FilePond no se cargó');
    return;
  }

  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateSize
  );

  FilePond.setOptions({
    name: 'archivo',          // <input name="archivo">
    allowMultiple: true,
    maxFileSize: '5MB',
    server: false,
    labelIdle: 'Arrastra o <span class="filepond--label-action">explora</span> archivos (máx 5 MB)'
  });

  /* Activa todos los <input class="filepond"> */
  FilePond.parse(document.body);
});
