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
