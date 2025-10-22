// Animation simple à l’arrivée sur la page
document.addEventListener("DOMContentLoaded", () => {
  const heroText = document.querySelector(".hero-text");
  heroText.style.opacity = 0;
  heroText.style.transform = "translateY(20px)";
  setTimeout(() => {
    heroText.style.transition = "all 0.6s ease";
    heroText.style.opacity = 1;
    heroText.style.transform = "translateY(0)";
  }, 200);
});
