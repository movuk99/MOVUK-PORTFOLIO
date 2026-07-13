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

## Agregar lugares nuevos (sección "Places I've worked at" en About)

Vive en `places.json`. Cada entrada es una foto + su ubicación:
```json
{ "src": "mi-foto.jpg", "location": "Ciudad, País" }
```
Sube la foto a la raíz del repo, agrega la entrada al arreglo, guarda. El mosaico se acomoda solo (masonry), y al pasar el mouse sobre cualquier foto se oscurece y muestra el nombre del lugar.

## Agregar fotos nuevas

No hace falta tocar HTML. Todo el contenido de las galerías vive en `photos.json`.

Cada categoría en Works tiene exactamente **9 casillas** (grid 3×3). Cada casilla puede tener una foto, varias fotos (se vuelve un mini-slideshow con flechas), o ninguna (queda vacía, marcada con un `+` sutil).

1. Sube tu imagen nueva a la raíz del repo (o usa un servicio externo gratis como imgbb.com y pega esa URL — así el repo no se llena de archivos pesados).
2. Abre `photos.json` (botón de lápiz para editar directo en github.com).
3. Busca la categoría (`Outdoors Photography`, `Film Photography`, `Culture and Travel`, `Others`) y encuentra una casilla vacía: `{ "photos": [] }`.
4. Agrega tu foto dentro de ese arreglo:
   ```json
   { "photos": [ { "src": "foto-nueva.jpg", "alt": "Descripción corta de la foto" } ] }
   ```
   Para que esa misma casilla sea un mini-slideshow, agrega más de una foto al arreglo:
   ```json
   { "photos": [
       { "src": "foto-1.jpg", "alt": "Descripción 1" },
       { "src": "foto-2.jpg", "alt": "Descripción 2" }
   ] }
   ```
5. Guarda ("Commit changes"). Listo, se actualiza solo.

> Si quieres agregar una categoría nueva, copia la estructura completa de una existente (nombre + 9 casillas) dentro del arreglo `categories`.

Para agregar un video nuevo, edita `videos.json`. El slider agrupa automáticamente de a 3 por página. Cada video soporta tres orígenes:

**YouTube** (como los que ya tienes):
```json
{
  "provider": "youtube",
  "id": "dQw4w9WgXcQ",
  "title": "Título del video",
  "description": "Descripción corta.",
  "tag": "Julio 2026"
}
```
El `id` es lo que aparece después de `v=` en la URL del video.

**Vimeo** (recomendado para lo nuevo — gratis, sin anuncios, sin límite de tamaño real):
```json
{
  "provider": "vimeo",
  "id": "76979871",
  "thumbnail": "https://i.vimeocdn.com/video/xxxxxxx.jpg",
  "title": "Título del video",
  "description": "Descripción corta.",
  "tag": "Julio 2026"
}
```
- El `id` es el número que aparece en la URL de tu video: `vimeo.com/76979871` → `76979871`.
- Antes de subir un video a Vimeo, asegúrate de que su privacidad permita "embed" en cualquier sitio (Settings → Privacy → Where can this be embedded → Anywhere).
- Para el `thumbnail`: abre en el navegador `https://vimeo.com/api/oembed.json?url=https://vimeo.com/TU_ID` (reemplazando TU_ID), busca el campo `"thumbnail_url"` en el texto que aparece, y copia esa URL. Si no pones `thumbnail`, la casilla muestra un fondo simple con el botón de play (sigue funcionando, solo sin vista previa).

**Auto-hospedado** (solo para clips cortos y bien comprimidos — ten en cuenta que GitHub limita cada archivo a 100MB y recomienda que el repo completo no pase de ~1GB):
```json
{
  "provider": "self",
  "id": "mi-clip.mp4",
  "thumbnail": "mi-clip-portada.jpg",
  "title": "Título del video",
  "description": "Descripción corta.",
  "tag": "Julio 2026"
}
```
Sube el `.mp4` (y opcionalmente una imagen de portada) a la raíz del repo junto con los demás archivos, y usa esos nombres de archivo en `id` y `thumbnail`.

## Formulario de contacto

Ya está conectado a tu formulario de Formspree (`mzdnbqbw`). Lo único que falta de tu lado:

1. Entra al dashboard de [formspree.io](https://formspree.io) → tu formulario → configuración de correos.
2. Confirma que **ambos** correos estén agregados y verificados:
   - `mmarcin.ieu2024@student.ie.edu`
   - `matiasmarcin@yahoo.com`
   
   Formspree manda un email de verificación a cada uno — si no lo confirmas, no te llegan los mensajes a esa cuenta.

Con el plan gratis tienes 50 envíos al mes, más que suficiente para un portafolio personal.

## Estructura del proyecto

```
movuk-portfolio/
├── index.html        → Home (slider a pantalla completa)
├── works.html         → Videografía (slider) + fotografía (grid 3x3)
├── about.html          → Bio + mosaico de lugares + posiciones actuales
├── contact.html          → Formulario de contacto
├── style.css               → Todos los estilos
├── main.js                  → Nav, sliders, galerías, mosaico, lightbox
├── photos.json                → Contenido de Works (editable)
├── videos.json                  → Lista de videos (editable)
├── places.json                    → Mosaico "Places I've worked at" (editable)
├── logo.png                        → Logo MOVUK usado en nav y footer
├── works-hero.mp4                    → Video de fondo en loop en Works
├── works-hero-poster.jpg               → Imagen de portada mientras carga el video
├── about-portrait.jpg                → Foto principal de About
└── place-*.jpg                        → Fotos del mosaico de lugares
```

## Notas de diseño

- Las fotos y videos actuales usan las URLs del CDN de Webflow (`cdn.prod.website-files.com`) — siguen funcionando de forma independiente al sitio de Webflow activo.
- Tipografías: Space Grotesk (títulos), Inter (texto), IBM Plex Mono (etiquetas/metadata) — vía Google Fonts.
- El lightbox (click en cualquier foto para verla en grande), el slider del home, el slider de videos, y el menú móvil funcionan sin librerías externas.
