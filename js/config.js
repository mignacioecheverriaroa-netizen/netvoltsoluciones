/*!
 * NetVolt Solutions — © 2026 Ignacio Echeverría Roa · SDT, Soluciones en Desarrollo Tecnológico.
 * Todos los derechos reservados. Prohibida su copia, modificación o uso sin autorización. Ver LICENSE.
 */
/* ==========================================================================
   NETVOLT SOLUTIONS — Configuración editable
   Todo lo que el cliente puede necesitar cambiar está aquí.
   Ver docs/configuracion.md para el detalle.
   ========================================================================== */
window.NV_CONFIG = Object.freeze({

  /* Líneas de WhatsApp. Los números NO se muestran en la página:
     se guardan codificados ("code") y solo se usan al abrir el chat.
     Para generar un código nuevo, abre la consola del navegador (F12) y ejecuta:
       btoa("56912345678".split("").reverse().join(""))
     (número con código de país, solo dígitos, sin "+"). Ver docs/configuracion.md */
  whatsapp: [
    { label: "Línea 1", code: "OTM4NDk4Nzc5NjU=" },
    { label: "Línea 2", code: "Njg2NjA3MjQ5NjU=" }
  ],

  /* Mensaje inicial al abrir WhatsApp desde el sitio */
  whatsappGreeting: "Hola NetVolt Solutions, quiero solicitar información sobre sus servicios.",

  /* Envío del formulario:
     - "formsubmit": funciona en cualquier hosting (Netlify, Vercel, GitHub Pages, cPanel…).
     - "php": usa api/contact.php (requiere hosting con PHP y función mail habilitada). */
  formProvider: "formsubmit",

  /* Correo que recibe las solicitudes (FormSubmit).
     Tras activar el formulario, puedes reemplazarlo por el alias cifrado que te envía
     FormSubmit (ej.: "a1b2c3d4e5f6...") para no exponer el correo en el código. */
  formEmail: "servicioselectricos.dev@outlook.com",

  /* Asunto de los correos recibidos */
  formSubject: "Nueva solicitud de cotización — NetVolt Solutions",

  /* Correo visible en la sección Contacto. Déjalo vacío ("") para ocultarlo. */
  publicEmail: "servicioselectricos.dev@outlook.com",

  /* Segundos mínimos entre el ingreso a la página y el envío (anti-bots) */
  minFillSeconds: 4,

  /* Segundos de espera entre envíos desde el mismo navegador */
  resendCooldown: 60
});
