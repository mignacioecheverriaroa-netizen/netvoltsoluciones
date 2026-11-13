# Configuración y publicación — NetVolt Solutions

Todo lo editable está en **`js/config.js`**. No es necesario tocar el HTML para cambiar números o correos.

---

## 1. WhatsApp (ya funciona, números privados)

Los números **no aparecen en la página**: los botones muestran «Línea 1» y «Línea 2», y el número solo se usa en el momento en que la persona pulsa el botón y se abre WhatsApp.

```js
whatsapp: [
  { label: "Línea 1", code: "…" },
  { label: "Línea 2", code: "…" }
],
whatsappGreeting: "Hola NetVolt Solutions, quiero solicitar información sobre sus servicios."
```

### Cambiar o agregar un número

1. Abre cualquier página en el navegador y presiona **F12** → pestaña **Consola**.
2. Escribe (con el número real: código de país + número, solo dígitos):
   ```js
   btoa("56912345678".split("").reverse().join(""))
   ```
3. Copia el resultado en `code` dentro de `js/config.js`.
4. `label` es el nombre que verá el visitante (ej.: «Ventas», «Soporte técnico»).

> Importante: la codificación evita que el número se vea en la página o lo capturen robots, pero **cuando la persona abre el chat, WhatsApp le muestra el número con el que está hablando**. Eso no se puede ocultar con un enlace de WhatsApp.

El botón **«Enviar por WhatsApp»** del formulario abre la Línea 1 con los datos que la persona ya escribió.

## 2. Formulario → correo (FormSubmit)

Configuración actual:

```js
formProvider: "formsubmit",
formEmail: "servicioselectricos.dev@outlook.com",
```

### Activación (una sola vez)

1. Publica el sitio (paso 4) o ábrelo con Live Server.
2. Completa y envía el formulario una vez.
3. El sitio mostrará «Formulario pendiente de activación».
4. Revisa la bandeja de entrada de `formEmail` en Outlook (y la carpeta **Correo no deseado**): llega un correo de **FormSubmit** con el botón **Activate Form**. Púlsalo.
5. Envía otra solicitud de prueba: ahora llegará el correo con la tabla de datos y el sitio mostrará «¡Solicitud enviada!».

> Si publicas en otro dominio después de activar, puede pedirse una nueva activación para ese dominio.

### Ocultar el correo del código (recomendado)

Tras la activación, FormSubmit envía un **alias cifrado** (una cadena larga de letras y números). Reemplaza el correo por ese alias:

```js
formEmail: "el-alias-que-envia-formsubmit",
```

### Cambiar el correo destino

Cambia `formEmail` por el nuevo correo y repite la activación.

### Correo visible en la página

`publicEmail` está configurado con `servicioselectricos.dev@outlook.com` y aparece en la sección Contacto y en el pie de página con enlace `mailto:`. Si lo dejas vacío (`""`), se oculta.

## 3. Alternativa: envío por PHP (hosting cPanel)

Solo si el hosting tiene PHP con `mail()` habilitado:

1. En `api/contact.php`, revisa `NV_TO` (correo destino) y cambia `NV_FROM` por una casilla de **tu dominio** (ej.: `no-reply@netvolt.cl`), si no, los correos pueden caer en spam.
2. En `js/config.js` cambia `formProvider: "php"`.
3. Sube todo y prueba el formulario.

El endpoint valida y sanitiza los datos, bloquea el honeypot, exige tiempo mínimo de llenado, limita un envío por minuto por IP y evita inyección de cabeceras.

## 4. Publicar en la web

### Opción A — Netlify Drop (gratis, 2 minutos)

1. Entra a <https://app.netlify.com/drop>.
2. Arrastra la carpeta **NETVOLT-SOLUTIONS** completa.
3. Netlify entrega una URL pública (`https://nombre.netlify.app`). Crea una cuenta para conservarla y conectar tu dominio.
4. Activa el formulario (paso 2).

### Opción B — Hosting cPanel

1. Administrador de archivos → `public_html`.
2. Sube el **contenido** de la carpeta `NETVOLT-SOLUTIONS` (no la carpeta en sí).
3. Activa el formulario (paso 2).

### Opción C — Vercel / GitHub Pages / Cloudflare Pages

Sube la carpeta como sitio estático, sin comando de build.

## 5. Dominio (SEO)

Dominio actual: **https://netvolt.smartgridgroup.cl** (subdominio de smartgridgroup.cl, NIC Chile, DNS en Cloudflare). Ya está configurado en `sitemap.xml`, `robots.txt` y en las metaetiquetas de `index.html`.


Cuando tengas el dominio definitivo, reemplaza `TU-DOMINIO.cl` en:

- `sitemap.xml`
- `robots.txt`
- `api/contact.php` (`NV_FROM`, solo si usas PHP)

Y, opcionalmente, agrega en el `<head>` de `index.html`:

```html
<link rel="canonical" href="https://tudominio.cl/">
<meta property="og:url" content="https://tudominio.cl/">
```

Cambia también `og:image` y `twitter:image` a la URL absoluta (`https://tudominio.cl/assets/img/og-netvolt.jpg`) para que la vista previa se vea en WhatsApp y redes.

## 6. Redes sociales

No se incluyeron porque no hay perfiles oficiales informados. Para agregarlos, añade enlaces en la columna «Contacto» del footer (`index.html`).

## 7. Seguridad incluida

- Content-Security-Policy en `index.html` (solo recursos propios + FormSubmit).
- `_headers` (Netlify/Cloudflare) y `.htaccess` (Apache) con cabeceras de seguridad y caché.
- Sin scripts de terceros: Bootstrap, íconos y fuentes se sirven desde el propio sitio.
- Formularios: validación, sanitización, honeypot, tiempo mínimo y límite de envíos.
