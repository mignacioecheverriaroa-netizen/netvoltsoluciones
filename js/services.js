/*!
 * NetVolt Solutions — © 2026 Miguel Ignacio Echeverria Roa · SDT, Soluciones en Desarrollo Tecnológico.
 * Todos los derechos reservados. Prohibida su copia, modificación o uso sin autorización. Ver LICENSE.
 */
/* ==========================================================================
   services.js — fichas de "Más información" y botones de cotización
   ========================================================================== */
(function () {
  "use strict";

  const SERVICES = {
    residencial: {
      title: "Instalaciones eléctricas domiciliarias",
      icon: "bi-house-gear",
      intro: "Soluciones eléctricas para viviendas: desde una mejora puntual hasta una instalación completa, con foco en la seguridad de las personas y el orden de cada circuito.",
      items: [
        "Instalaciones eléctricas nuevas y ampliaciones.",
        "Normalización y mejora de tableros y circuitos.",
        "Iluminación interior y exterior.",
        "Enchufes, circuitos dedicados y puntos de carga.",
        "Diagnóstico de fallas y mantención preventiva."
      ],
      ideal: "Casas y departamentos, remodelaciones y ampliaciones."
    },
    iot: {
      title: "Automatización domiciliaria IoT",
      icon: "bi-phone-vibrate",
      intro: "Convertimos tu hogar en un espacio inteligente: controla y monitorea iluminación, equipos y sensores desde el celular, con escenas y rutinas automáticas.",
      items: [
        "Iluminación y enchufes inteligentes.",
        "Control de climatización, persianas y portones.",
        "Sensores de movimiento, apertura y consumo.",
        "Escenas, horarios y automatizaciones.",
        "Integración con asistentes de voz y aplicaciones móviles."
      ],
      ideal: "Hogares que buscan comodidad, control remoto y ahorro de energía."
    },
    industrial: {
      title: "Instalaciones eléctricas industriales",
      icon: "bi-buildings",
      intro: "Instalaciones eléctricas pensadas para la exigencia de los entornos productivos: alimentación de maquinaria, tableros y canalizaciones ordenadas y seguras.",
      items: [
        "Tableros de fuerza, distribución y control.",
        "Alimentación eléctrica de máquinas y equipos.",
        "Canalizaciones, bandejas portaconductores y cableado.",
        "Iluminación industrial.",
        "Mantención preventiva y correctiva."
      ],
      ideal: "Plantas, talleres, bodegas y recintos productivos."
    },
    telemetria: {
      title: "Monitoreo industrial, telemetría e IoT",
      icon: "bi-broadcast-pin",
      intro: "Medimos lo que importa: sensores, adquisición de datos y conectividad para ver el estado de procesos y equipos en tiempo real y actuar a tiempo.",
      items: [
        "Sensores de variables eléctricas y de proceso.",
        "Adquisición de datos y registro histórico.",
        "Telemetría y comunicación remota de equipos.",
        "Paneles de visualización (dashboards) y alertas.",
        "Integración con sistemas y protocolos industriales."
      ],
      ideal: "Industrias que necesitan visibilidad de consumos, procesos y activos."
    }
  };
  window.NV_SERVICES = SERVICES;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /** Preselecciona el servicio en el formulario y lleva al usuario a contacto */
  function quote(serviceName) {
    const select = document.getElementById("fService");
    if (select && serviceName) {
      const opt = Array.from(select.options).find((o) => o.text === serviceName);
      if (opt) { select.value = opt.value || opt.text; select.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    const name = document.getElementById("fName");
    if (name) setTimeout(() => name.focus({ preventScroll: true }), 650);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const modalEl = document.getElementById("serviceModal");
    const modal = modalEl && window.bootstrap ? window.bootstrap.Modal.getOrCreateInstance(modalEl) : null;

    document.querySelectorAll("[data-service-info]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = SERVICES[btn.dataset.serviceInfo];
        if (!s || !modal) return;
        document.getElementById("serviceModalTitle").textContent = s.title;
        document.getElementById("serviceModalIcon").innerHTML = '<i class="bi ' + esc(s.icon) + '"></i>';
        document.getElementById("serviceModalBody").innerHTML =
          "<p>" + esc(s.intro) + "</p>" +
          "<h3>Qué incluye</h3><ul class=\"nv-checklist\">" +
          s.items.map((i) => '<li><i class="bi bi-check2-circle" aria-hidden="true"></i><span>' + esc(i) + "</span></li>").join("") +
          "</ul><h3>Ideal para</h3><p class=\"mb-0\">" + esc(s.ideal) + "</p>";
        document.getElementById("serviceModalQuote").dataset.quote = s.title;
        modal.show();
      });
    });

    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-quote]");
      if (!a) return;
      const name = a.dataset.quote;
      if (a.id === "serviceModalQuote" && modal) {
        e.preventDefault();
        modalEl.addEventListener("hidden.bs.modal", () => {
          document.getElementById("contacto").scrollIntoView({ behavior: window.NV.reducedMotion ? "auto" : "smooth" });
          quote(name);
        }, { once: true });
        modal.hide();
        return;
      }
      quote(name);
    });
  });
})();
