# NETVOLT SOLUTIONS — Sitio web corporativo

Landing page corporativa *one page* para **NetVolt Solutions**: soluciones eléctricas, automatización IoT, eficiencia energética e integración industrial.

Sitio web creado por **SDT — Soluciones en Desarrollo Tecnológico**.

---

## Características

- Identidad visual nueva: logotipo horizontal, símbolo, versiones para fondo oscuro y claro, favicon y recursos SVG.
- HTML5 semántico, CSS propio organizado por capas y JavaScript moderno sin frameworks.
- **Bootstrap 5.3.3** y **Bootstrap Icons 1.11.3** servidos localmente (sin CDN).
- Fuentes **Space Grotesk** e **Inter** alojadas localmente (sin llamadas a Google).
- Huincha animada infinita con duplicación estructural (sin saltos), pausa al pasar el cursor y soporte de `prefers-reduced-motion`.
- Catálogo de cuatro servicios con ilustraciones vectoriales propias, ficha «Más información» y botón «Cotizar» que preselecciona el servicio.
- **WhatsApp operativo** con dos líneas privadas: los números no se muestran en la página y se guardan codificados.
- **Formulario de cotización con envío real a correo** (FormSubmit) y alternativa PHP propia.
- Validación en el navegador y en el servidor, sanitización, honeypot anti-spam, tiempo mínimo de llenado y límite de envíos.
- SEO: metadatos, Open Graph, datos estructurados, `sitemap.xml`, `robots.txt` y manifest.
- Seguridad: Content-Security-Policy, cabeceras para Netlify (`_headers`) y Apache (`.htaccess`).
- Responsive para escritorio, notebook, tablet y smartphone.

## Estructura

```
NETVOLT-SOLUTIONS/
├── index.html
├── README.md
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── _headers                 ← cabeceras de seguridad (Netlify / Cloudflare Pages)
├── .htaccess                ← cabeceras y caché (Apache / cPanel)
├── api/
│   └── contact.php          ← envío alternativo por PHP (opcional)
├── assets/
│   ├── fonts/               ← Inter y Space Grotesk (woff2 variables)
│   ├── icons/               ← logotipos, símbolo, favicon e íconos de app
│   ├── img/                 ← ilustraciones, pieza de marca (netvolt-brand), Open Graph, logo SDT
│   └── vendor/              ← Bootstrap 5.3.3 y Bootstrap Icons
├── css/
│   ├── variables.css        ← paleta, tipografía y tokens
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── config.js            ← ⚙️ números de WhatsApp, correo y opciones del formulario
│   ├── main.js
│   ├── navigation.js
│   ├── animations.js
│   ├── services.js
│   └── contact.js
└── docs/
    └── configuracion.md     ← activación del correo y publicación paso a paso
```

## Ejecutar en local

1. Descomprime el ZIP y abre la carpeta `NETVOLT-SOLUTIONS` en **Visual Studio Code**.
2. Instala la extensión recomendada **Live Server** (VS Code la sugiere automáticamente).
3. Clic derecho sobre `index.html` → **Open with Live Server**.

> El sitio se ve correctamente abriendo `index.html` con doble clic, pero **el formulario solo envía cuando se sirve desde un servidor** (Live Server o el sitio publicado). Es una restricción de seguridad del navegador y del servicio de correo.

Alternativa sin VS Code: `python -m http.server 8000` dentro de la carpeta y abrir `http://localhost:8000`.

## Publicar y activar el formulario

Ver **[docs/configuracion.md](docs/configuracion.md)**. Resumen:

1. Publica la carpeta (Netlify Drop, Vercel, GitHub Pages o tu hosting cPanel).
2. Envía una solicitud de prueba desde el sitio publicado.
3. Abre el correo de **FormSubmit** que llega a la casilla configurada y pulsa **Activate Form**.
4. Desde ese momento, todas las solicitudes llegan a ese correo.

## Créditos

- Diseño, desarrollo e identidad visual: **SDT — Soluciones en Desarrollo Tecnológico**.
- Bootstrap y Bootstrap Icons © The Bootstrap Authors (licencia MIT).
- Inter y Space Grotesk (SIL Open Font License).
