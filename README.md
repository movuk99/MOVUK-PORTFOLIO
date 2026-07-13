# MOVUK — Portfolio

Sitio estático (HTML/CSS/JS puro, sin build tools) para el portafolio de fotografía y videografía de Matías Marcin.

## Ver el sitio localmente

Como el sitio carga los datos de las galerías desde archivos `.json` con `fetch()`, abrir `index.html` directamente con doble clic **no funcionará** (los navegadores bloquean `fetch` sobre `file://`). Corre un servidor local simple:

```bash
cd movuk-portfolio
python3 -m http.server 8000
```

Y abre `http://localhost:8000` en tu navegador.

(Una vez publicado en GitHub Pages esto no es un problema — funciona directo.)

## Publicar gratis en GitHub Pages

Todos los archivos viven sueltos en la raíz del repo (sin subcarpetas), para que subirlos por drag-and-drop en github.com funcione sin complicaciones.

1. En tu repo `movuk-portfolio`, sube (o reemplaza) estos archivos arrastrándolos directo a la raíz con **Add file → Upload files**.
2. Ve a **Settings → Pages**. En "Build and deployment" → Source, elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guarda.
3. En 1–2 minutos tu sitio va a estar en `https://movuk99.github.io/movuk-portfolio/`.

> Nota: como el repo se llama `movuk-portfolio` (no `movuk99.github.io`), tu URL incluye `/movuk-portfolio/` al final. Si prefieres el dominio limpio `https://movuk99.github.io`, tendrías que crear un repo nuevo con ese nombre exacto y subir los archivos ahí — es la única diferencia.

Cada vez que reemplaces un archivo desde la web de GitHub, el sitio se actualiza solo en 1–2 minutos.

## Agregar fotos nuevas

No hace falta tocar HTML. Todo el contenido de las galerías vive en `photos.json`.

1. Sube tu imagen nueva a la raíz del repo (o usa un servicio externo gratis como imgbb.com y pega esa URL — así el repo no se llena de archivos pesados).
2. Abre `photos.json` (botón de lápiz para editar directo en github.com) y agrega una entrada dentro de la categoría que corresponda:
   ```json
   { "src": "foto-nueva.jpg", "alt": "Descripción corta de la foto" }
   ```
3. Guarda ("Commit changes"). Listo, se actualiza solo.

Para agregar un video nuevo, edita `videos.json` de la misma forma (solo necesitas el ID de YouTube, el que aparece después de `v=` en la URL del video). El slider de videos agrupa automáticamente de a 3 por página.

## Activar el formulario de contacto

El formulario en `contact.html` está listo para [Formspree](https://formspree.io) (gratis hasta 50 envíos/mes, sin backend):

1. Crea una cuenta gratuita en formspree.io y un formulario nuevo.
2. Copia el ID que te dan (algo como `xzbqrkyz`).
3. En `contact.html`, reemplaza `YOUR_FORM_ID` en la línea `action="https://formspree.io/f/YOUR_FORM_ID"` por ese ID.

## Estructura del proyecto

```
movuk-portfolio/
├── index.html        → Home (slider a pantalla completa)
├── works.html         → Videografía (slider) + fotografía (grid)
├── about.html          → Bio
├── contact.html          → Formulario de contacto
├── style.css               → Todos los estilos
├── main.js                  → Nav, slider home, galerías, video slider, lightbox
├── photos.json                → Contenido de las galerías (editable)
├── videos.json                  → Lista de videos (editable)
└── logo.png                       → Logo MOVUK usado en nav y footer
```

## Notas de diseño

- Las fotos y videos actuales usan las URLs del CDN de Webflow (`cdn.prod.website-files.com`) — siguen funcionando de forma independiente al sitio de Webflow activo.
- Tipografías: Space Grotesk (títulos), Inter (texto), IBM Plex Mono (etiquetas/metadata) — vía Google Fonts.
- El lightbox (click en cualquier foto para verla en grande), el slider del home, el slider de videos, y el menú móvil funcionan sin librerías externas.
