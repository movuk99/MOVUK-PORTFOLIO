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

1. En GitHub, crea un repositorio nuevo llamado exactamente **`tu-usuario.github.io`** (reemplaza `tu-usuario` por tu username real). Esto lo convierte en tu sitio principal.
2. Sube el contenido de esta carpeta a ese repo:
   ```bash
   cd movuk-portfolio
   git init
   git add .
   git commit -m "Portfolio inicial"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/tu-usuario.github.io.git
   git push -u origin main
   ```
3. En GitHub → repo → **Settings → Pages**, confirma que la fuente sea la rama `main` (usualmente se activa solo).
4. En 1–2 minutos tu sitio estará en `https://tu-usuario.github.io`.

Cada vez que hagas `git push`, el sitio se actualiza solo.

## Agregar fotos nuevas

No hace falta tocar HTML. Todo el contenido de las galerías vive en `data/photos.json`.

1. Sube tu imagen nueva a la carpeta `images/` (organiza por categoría si quieres, ej. `images/outdoors/foto.jpg`).
2. Abre `data/photos.json` y agrega una entrada dentro de la categoría que corresponda (o crea una categoría nueva copiando la estructura):
   ```json
   { "src": "images/outdoors/foto.jpg", "alt": "Descripción corta de la foto" }
   ```
3. Guarda, haz commit y push. Listo.

Para agregar un video nuevo, edita `data/videos.json` de la misma forma (solo necesitas el ID de YouTube, el que aparece después de `v=` en la URL del video).

## Activar el formulario de contacto

El formulario en `contact.html` está listo para [Formspree](https://formspree.io) (gratis hasta 50 envíos/mes, sin backend):

1. Crea una cuenta gratuita en formspree.io y un formulario nuevo.
2. Copia el ID que te dan (algo como `xzbqrkyz`).
3. En `contact.html`, reemplaza `YOUR_FORM_ID` en la línea `action="https://formspree.io/f/YOUR_FORM_ID"` por ese ID.

## Estructura del proyecto

```
movuk-portfolio/
├── index.html          → Home
├── works.html           → Videografía + fotografía
├── about.html            → Bio
├── contact.html            → Formulario de contacto
├── css/style.css            → Todos los estilos
├── js/main.js                → Nav, galerías, lightbox, video cards
├── data/photos.json            → Contenido de las galerías (editable)
├── data/videos.json             → Lista de videos (editable)
└── images/                       → Fotos nuevas que subas (opcional)
```

## Notas de diseño

- Las fotos y videos actuales usan las URLs del CDN de Webflow (`cdn.prod.website-files.com`) — siguen funcionando de forma independiente al sitio de Webflow activo.
- Tipografías: Space Grotesk (títulos), Inter (texto), IBM Plex Mono (etiquetas/metadata) — vía Google Fonts.
- El lightbox (click en cualquier foto para verla en grande) y el menú móvil funcionan sin librerías externas.
