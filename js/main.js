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
