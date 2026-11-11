/* ==========================================================================
   contact.js — validación, protección anti-spam y envío real del formulario
   No simula envíos: solo muestra éxito si el servicio confirma la recepción.
   ========================================================================== */
(function () {
  "use strict";

  const CFG = window.NV_CONFIG || {};
  const LOADED_AT = Date.now();
  const STORAGE_KEY = "nv:lastSubmit";

  /* ---------- Sanitización ---------- */
  const clean = (v, max) =>
    String(v || "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // caracteres de control
      .replace(/[<>]/g, "")                                          // sin etiquetas HTML
      .replace(/[ \t]+/g, " ")
      .trim()
      .slice(0, max);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const RULES = {
    nombre:   (v) => v.length >= 2 && v.length <= 80 && /[a-záéíóúñü]/i.test(v),
    email:    (v) => v.length <= 120 && EMAIL_RE.test(v),
    telefono: (v) => /^[+\d\s().-]+$/.test(v) && (v.replace(/\D/g, "").length >= 8 && v.replace(/\D/g, "").length <= 15),
    servicio: (v) => v.length > 0,
    mensaje:  (v) => v.length >= 20 && v.length <= 2000
  };

  const storage = {
    get() { try { return Number(localStorage.getItem(STORAGE_KEY)) || 0; } catch (_) { return 0; } },
    set(v) { try { localStorage.setItem(STORAGE_KEY, String(v)); } catch (_) { /* almacenamiento no disponible */ } }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("quoteForm");
    if (!form) return;

    const f = {
      nombre: form.elements.nombre,
      email: form.elements.email,
      telefono: form.elements.telefono,
      servicio: form.elements.servicio,
      mensaje: form.elements.mensaje,
      consent: form.elements.consentimiento,
      honey: form.elements._honey
    };
    const statusBox = document.getElementById("formStatus");
    const submitBtn = document.getElementById("formSubmit");
    const waBtn = document.getElementById("formWhatsapp");
    const counter = document.getElementById("fCounter");
    const msgError = document.getElementById("fMessageError");

    /* ---------- Estado visual de campos ---------- */
    function mark(name) {
      const el = f[name];
      const ok = name === "consent" ? el.checked : RULES[name](clean(el.value, 4000));
      el.classList.toggle("is-invalid", !ok);
      el.classList.toggle("is-valid", ok && name !== "consent");
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      if (name === "mensaje" && msgError) msgError.classList.toggle("is-shown", !ok);
      return ok;
    }
    const validateAll = () => ["nombre", "email", "telefono", "servicio", "mensaje", "consent"].map(mark).every(Boolean);

    ["nombre", "email", "telefono", "servicio", "mensaje"].forEach((n) => {
      f[n].addEventListener("blur", () => { if (f[n].value) mark(n); });
      f[n].addEventListener("input", () => { if (f[n].classList.contains("is-invalid")) mark(n); });
      f[n].addEventListener("change", () => { if (f[n].value) mark(n); });
    });
    f.consent.addEventListener("change", () => mark("consent"));

    const updateCounter = () => { counter.textContent = f.mensaje.value.length + " / 2000"; };
    f.mensaje.addEventListener("input", updateCounter);
    updateCounter();

    /* ---------- Mensajes ---------- */
    function showStatus(type, html) {
      const icon = { success: "bi-check-circle-fill", error: "bi-exclamation-triangle-fill", info: "bi-envelope-exclamation-fill" }[type];
      statusBox.className = "nv-form__status is-" + type;
      statusBox.innerHTML = '<i class="bi ' + icon + '" aria-hidden="true"></i><div>' + html + "</div>";
      statusBox.hidden = false;
      statusBox.scrollIntoView({ behavior: window.NV.reducedMotion ? "auto" : "smooth", block: "nearest" });
    }
    const setLoading = (on) => {
      submitBtn.classList.toggle("is-loading", on);
      submitBtn.disabled = on;
      form.setAttribute("aria-busy", on ? "true" : "false");
    };

    function payload() {
      return {
        nombre: clean(f.nombre.value, 80),
        email: clean(f.email.value, 120),
        telefono: clean(f.telefono.value, 20),
        servicio: clean(f.servicio.value, 80),
        mensaje: clean(f.mensaje.value, 2000)
      };
    }

    /* ---------- Envío por proveedor ---------- */
    async function sendFormSubmit(data) {
      const target = String(CFG.formEmail || "").trim();
      if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)+$|^[a-z0-9]{16,}$/i.test(target)) throw new Error("config");
      const res = await fetch("https://formsubmit.co/ajax/" + target, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Nombre: data.nombre,
          email: data.email,
          "Teléfono": data.telefono,
          Servicio: data.servicio,
          "Descripción del proyecto": data.mensaje,
          _subject: CFG.formSubject || "Nueva solicitud de cotización",
          _template: "table",
          _captcha: "false",
          _honey: ""
        })
      });
      let json = {};
      try { json = await res.json(); } catch (_) { /* respuesta no JSON */ }
      const ok = res.ok && (json.success === true || json.success === "true");
      if (ok) return { ok: true };
      const msg = String(json.message || "");
      if (/activat/i.test(msg)) return { ok: false, activation: true };
      return { ok: false, message: msg };
    }

    async function sendPhp(data) {
      const body = new URLSearchParams({ ...data, _honey: "", _t: String(LOADED_AT) });
      const res = await fetch("api/contact.php", {
        method: "POST",
        headers: { Accept: "application/json" },
        body
      });
      let json = {};
      try { json = await res.json(); } catch (_) { /* respuesta no JSON */ }
      return res.ok && json.ok ? { ok: true } : { ok: false, message: json.error || "" };
    }

    /* ---------- Submit ---------- */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusBox.hidden = true;

      if (!validateAll()) {
        showStatus("error", "Revisa los campos marcados en rojo antes de enviar.");
        const first = form.querySelector(".is-invalid");
        first?.focus();
        return;
      }

      /* Anti-spam: honeypot, tiempo mínimo y enfriamiento entre envíos */
      if (f.honey && f.honey.value) { form.reset(); return; }
      if ((Date.now() - LOADED_AT) / 1000 < (CFG.minFillSeconds || 4)) {
        showStatus("error", "El formulario se envió demasiado rápido. Espera unos segundos e inténtalo nuevamente.");
        return;
      }
      const since = (Date.now() - storage.get()) / 1000;
      const cooldown = CFG.resendCooldown || 60;
      if (since < cooldown) {
        showStatus("info", "Ya recibimos una solicitud desde este navegador. Podrás enviar otra en " + Math.ceil(cooldown - since) + " segundos.");
        return;
      }
      if (location.protocol === "file:" && CFG.formProvider !== "php") {
        showStatus("error", "Para enviar el formulario, el sitio debe abrirse desde un servidor (por ejemplo, la extensión <strong>Live Server</strong> de VS Code) o estar publicado en la web.");
        return;
      }

      setLoading(true);
      try {
        const data = payload();
        const result = CFG.formProvider === "php" ? await sendPhp(data) : await sendFormSubmit(data);

        if (result.ok) {
          storage.set(Date.now());
          form.reset();
          form.querySelectorAll(".is-valid, .is-invalid").forEach((el) => el.classList.remove("is-valid", "is-invalid"));
          msgError?.classList.remove("is-shown");
          updateCounter();
          showStatus("success", "<strong>¡Solicitud enviada!</strong> Recibimos tu mensaje y te contactaremos a la brevedad.");
        } else if (result.activation) {
          showStatus("info", "<strong>Formulario pendiente de activación.</strong> El administrador del sitio debe confirmar el correo de activación enviado por FormSubmit. Mientras tanto, puedes escribirnos por WhatsApp.");
        } else {
          showStatus("error", "No pudimos enviar tu solicitud en este momento. Inténtalo nuevamente o escríbenos por WhatsApp.");
        }
      } catch (err) {
        showStatus("error", "No hay conexión con el servicio de envío. Revisa tu conexión a internet o escríbenos por WhatsApp.");
      } finally {
        setLoading(false);
      }
    });

    /* ---------- Enviar los datos del formulario por WhatsApp ---------- */
    waBtn?.addEventListener("click", () => {
      const d = payload();
      const lines = [
        "Hola NetVolt Solutions, quiero solicitar una cotización.",
        d.nombre && "Nombre: " + d.nombre,
        d.email && "Correo: " + d.email,
        d.telefono && "Teléfono: " + d.telefono,
        d.servicio && "Servicio: " + d.servicio,
        d.mensaje && "Proyecto: " + d.mensaje
      ].filter(Boolean);
      window.NV.openWhatsapp(0, lines.join("\n"));
    });
  });
})();
