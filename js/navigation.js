/*!
 * NetVolt Solutions — © 2026 Miguel Ignacio Echeverria Roa · SDT, Soluciones en Desarrollo Tecnológico.
 * Todos los derechos reservados. Prohibida su copia, modificación o uso sin autorización. Ver LICENSE.
 */
/* ==========================================================================
   navigation.js — header sticky, menú móvil e indicador de sección activa
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const NV = window.NV;
    const header = NV.$(".nv-header");
    const menu = NV.$("#nvMenu");
    const burger = NV.$(".nv-burger");
    const links = NV.$$("[data-nav]");

    /* Fondo con blur al hacer scroll */
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* Menú móvil: cerrar al elegir un enlace, con Escape o al pasar a escritorio */
    if (menu && window.bootstrap) {
      const collapse = window.bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });
      const isOpen = () => menu.classList.contains("show");

      NV.$$("a", menu).forEach((a) => a.addEventListener("click", () => { if (isOpen()) collapse.hide(); }));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen()) { collapse.hide(); burger?.focus(); }
      });
      menu.addEventListener("shown.bs.collapse", () => burger?.setAttribute("aria-label", "Cerrar menú"));
      menu.addEventListener("hidden.bs.collapse", () => burger?.setAttribute("aria-label", "Abrir menú"));
      window.matchMedia("(min-width: 992px)").addEventListener("change", (m) => { if (m.matches && isOpen()) collapse.hide(); });
    }

    /* Indicador de sección activa */
    const sections = links.map((l) => NV.$(l.getAttribute("href"))).filter(Boolean);
    const setActive = (id) => {
      links.forEach((l) => {
        const on = l.getAttribute("href") === "#" + id;
        l.classList.toggle("active", on);
        if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
      });
    };

    if ("IntersectionObserver" in window && sections.length) {
      const visible = new Map();
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best = null, max = 0;
        visible.forEach((ratio, id) => { if (ratio > max) { max = ratio; best = id; } });
        if (best) setActive(best);
      }, { rootMargin: "-35% 0px -55% 0px", threshold: [0, .01, .25, .5, 1] });
      sections.forEach((s) => io.observe(s));
    }
  });
})();
