/*!
 * NetVolt Solutions — © 2026 Ignacio Echeverría Roa · SDT, Soluciones en Desarrollo Tecnológico.
 * Todos los derechos reservados. Prohibida su copia, modificación o uso sin autorización. Ver LICENSE.
 */
/* ==========================================================================
   main.js — utilidades compartidas, WhatsApp y arranque general
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const CFG = window.NV_CONFIG || {};
  const NV = (window.NV = window.NV || {});

  NV.$ = (sel, ctx) => (ctx || document).querySelector(sel);
  NV.$$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  NV.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* El número se decodifica solo en el momento de abrir el chat (nunca se escribe en la página) */
  const decode = (code) => {
    try { return atob(String(code)).split("").reverse().join("").replace(/\D/g, ""); } catch (_) { return ""; }
  };

  /** Construye un enlace wa.me con texto opcional */
  NV.waUrl = function (index, text) {
    const lines = CFG.whatsapp || [];
    const line = lines[index] || lines[0];
    if (!line) return null;
    const digits = decode(line.code);
    if (digits.length < 8) return null;
    const msg = text || CFG.whatsappGreeting || "";
    return "https://wa.me/" + digits + (msg ? "?text=" + encodeURIComponent(msg) : "");
  };

  /** Abre WhatsApp en una pestaña nueva */
  NV.openWhatsapp = function (index, text) {
    const url = NV.waUrl(index, text);
    if (!url) return false;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  };

  /* Etiquetas visibles y clics de todos los botones de WhatsApp */
  function syncWhatsapp() {
    const lines = CFG.whatsapp || [];
    NV.$$("[data-wa-index]").forEach((a) => {
      const i = Number(a.dataset.waIndex);
      const line = lines[i];
      if (!line) { (a.closest("li") || a).hidden = true; return; }
      const label = NV.$("[data-wa-label]", a);
      if (label) label.textContent = (label.textContent.startsWith("WhatsApp") ? "WhatsApp · " : "") + line.label;
      a.setAttribute("aria-label", "Abrir WhatsApp: " + line.label);
      a.addEventListener("click", (e) => {
        if (NV.openWhatsapp(i)) e.preventDefault();
      });
    });
  }

  /* Botón flotante de WhatsApp con selector de línea */
  function floatingWhatsapp() {
    const btn = NV.$("#nvWaBtn");
    const panel = NV.$("#nvWaPanel");
    if (!btn || !panel) return;
    const lines = CFG.whatsapp || [];

    const close = () => { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); };
    const open = () => { panel.hidden = false; btn.setAttribute("aria-expanded", "true"); NV.$("a", panel)?.focus(); };

    btn.addEventListener("click", () => {
      if (lines.length === 1) { NV.openWhatsapp(0); return; }
      panel.hidden ? open() : close();
    });
    document.addEventListener("click", (e) => { if (!panel.hidden && !e.target.closest("#nvWa")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { close(); btn.focus(); } });
    NV.$$("a", panel).forEach((a) => a.addEventListener("click", () => setTimeout(close, 0)));
  }

  /* Correo público opcional */
  function publicEmail() {
    const email = (CFG.publicEmail || "").trim();
    const wrap = NV.$("#nvEmailChannel");
    const link = NV.$("#nvEmailLink");
    if (!email || !wrap || !link) return;
    link.href = "mailto:" + email;
    const at = email.indexOf("@");
    link.textContent = at > 0 ? email.slice(0, at) : email;
    if (at > 0) { link.append(document.createElement("wbr"), email.slice(at)); }
    link.classList.add("nv-channel__value--email");
    wrap.hidden = false;
    const fe = NV.$("#nvFooterEmail");
    if (fe) {
      const a = NV.$("[data-public-email]", fe);
      a.href = "mailto:" + email;
      NV.$("span", a).textContent = email;
      fe.hidden = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const y = NV.$("#year");
    if (y) y.textContent = String(new Date().getFullYear());
    syncWhatsapp();
    floatingWhatsapp();
    publicEmail();
  });
})();
