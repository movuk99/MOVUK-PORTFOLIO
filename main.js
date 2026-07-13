// ============================================================
// MOVUK — shared front-end logic
// ============================================================

// ---- mobile nav toggle ----
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('is-open'))
  );
}

// ---- lightbox ----
function buildLightbox() {
  const el = document.createElement('div');
  el.className = 'lightbox';
  el.innerHTML = `
    <button class="lightbox-close" aria-label="Close">✕</button>
    <img src="" alt="">
    <figcaption></figcaption>
  `;
  document.body.appendChild(el);

  const img = el.querySelector('img');
  const caption = el.querySelector('figcaption');
  const closeBtn = el.querySelector('.lightbox-close');

  function open(src, alt, tag) {
    img.src = src;
    img.alt = alt || '';
    caption.textContent = tag || alt || '';
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    el.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  closeBtn.addEventListener('click', close);
  el.addEventListener('click', (e) => { if (e.target === el) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  return { open };
}

// ---- render a masonry gallery from a photo array into a container ----
function renderGallery(container, photos, lightbox, categoryLabel) {
  photos.forEach(p => {
    const fig = document.createElement('figure');
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.alt || '';
    img.loading = 'lazy';
    fig.appendChild(img);
    fig.addEventListener('click', () => {
      const tag = categoryLabel ? `${categoryLabel} — ${p.alt}` : p.alt;
      lightbox.open(p.src, p.alt, tag);
    });
    container.appendChild(fig);
  });
}

// ---- render video cards ----
function renderVideos(container, videos) {
  videos.forEach(v => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="video-embed">
        <iframe src="https://www.youtube.com/embed/${v.youtubeId}" title="${v.title}"
          loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
      <div class="video-meta">
        <h3>${v.title}</h3>
        <p>${v.description}</p>
        <span class="video-tag">${v.tag}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  const lightbox = buildLightbox();

  // Home hero grid
  const heroGrid = document.querySelector('[data-gallery="hero"]');
  if (heroGrid) {
    fetch('photos.json')
      .then(r => r.json())
      .then(data => renderGallery(heroGrid, data.hero, lightbox));
  }

  // Works page: photography categories + video list
  const worksPhotos = document.querySelector('[data-works="photography"]');
  const worksVideos = document.querySelector('[data-works="videography"]');
  if (worksPhotos) {
    fetch('photos.json')
      .then(r => r.json())
      .then(data => {
        data.categories.forEach((cat, i) => {
          const header = document.createElement('div');
          header.className = 'cat-header';
          header.innerHTML = `
            <span class="cat-index">${String(i + 1).padStart(2, '0')} / ${String(data.categories.length).padStart(2, '0')}</span>
            <h2>${cat.name}</h2>
            <span class="rule"></span>
          `;
          worksPhotos.appendChild(header);

          const grid = document.createElement('div');
          grid.className = 'gallery';
          worksPhotos.appendChild(grid);
          renderGallery(grid, cat.photos, lightbox, cat.name);
        });
      });
  }
  if (worksVideos) {
    fetch('videos.json')
      .then(r => r.json())
      .then(videos => renderVideos(worksVideos, videos));
  }
});
