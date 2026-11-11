/*!
 * NetVolt Solutions — © 2026 Miguel Ignacio Echeverria Roa · SDT, Soluciones en Desarrollo Tecnológico.
 * Todos los derechos reservados. Prohibida su copia, modificación o uso sin autorización. Ver LICENSE.
 */
/* ==========================================================================
   animations.js — aparición progresiva y ajustes de animación
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const NV = window.NV;
    const items = NV.$$("[data-reveal]");

    /* Escalonado dentro de grupos (tarjetas, features) */
    NV.$$(".row").forEach((row) => {
      NV.$$(":scope > [class*='col'] > [data-reveal]", row).forEach((el, i) => {
        el.style.setProperty("--reveal-delay", (i % 4) * 0.08 + "s");
      });
    });

    if (NV.reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      items.forEach((el) => io.observe(el));
    }

    /* Ancho real de la línea de tiempo para el pulso que la recorre */
    const tl = NV.$(".nv-timeline");
    if (tl) {
      const setW = () => tl.style.setProperty("--nv-tl-w", Math.max(0, tl.clientWidth - 62) + "px");
      setW();
      window.addEventListener("resize", setW, { passive: true });
    }

    /* Pausa animaciones del hero cuando no está en pantalla (rendimiento) */
    const hero = NV.$(".nv-hero");
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => hero.classList.toggle("is-offscreen", !e.isIntersecting)).observe(hero);
    }
  });
})();
