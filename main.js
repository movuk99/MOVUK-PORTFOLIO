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

// ---- full-bleed hero slider ----
function initSlider(container, photos) {
  let current = 0;
  let timer = null;

  container.innerHTML = '';
  const slidesWrap = document.createElement('div');
  photos.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (i === 0 ? ' is-active' : '');
    slide.innerHTML = `<img src="${p.src}" alt="${p.alt || ''}" loading="${i === 0 ? 'eager' : 'lazy'}">`;
    slidesWrap.appendChild(slide);
  });
  container.appendChild(slidesWrap);

  const prevBtn = document.createElement('button');
  prevBtn.className = 'slider-arrow prev';
  prevBtn.setAttribute('aria-label', 'Previous photo');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'slider-arrow next';
  nextBtn.setAttribute('aria-label', 'Next photo');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';

  const dots = document.createElement('div');
  dots.className = 'slider-dots';
  photos.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  });

  container.appendChild(prevBtn);
  container.appendChild(nextBtn);
  container.appendChild(dots);

  const slideEls = () => container.querySelectorAll('.slide');
  const dotEls = () => dots.querySelectorAll('button');

  function goTo(i) {
    current = (i + photos.length) % photos.length;
    slideEls().forEach((s, idx) => s.classList.toggle('is-active', idx === current));
    dotEls().forEach((d, idx) => d.classList.toggle('is-active', idx === current));
    resetTimer();
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }
  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  resetTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  const lightbox = buildLightbox();

  // Home full-bleed slider
  const heroSlider = document.querySelector('[data-slider="hero"]');
  if (heroSlider) {
    fetch('photos.json')
      .then(r => r.json())
      .then(data => initSlider(heroSlider, data.hero));
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
