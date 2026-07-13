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

// ---- render a fixed 3x3 grid of slots; each slot may hold 1+ photos (mini-slideshow) ----
function renderSlotGrid(container, slots, lightbox, categoryLabel) {
  slots.forEach(slot => {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';

    if (!slot.photos || slot.photos.length === 0) {
      cell.classList.add('is-empty');
      container.appendChild(cell);
      return;
    }

    const photos = slot.photos;
    let idx = 0;

    const imgEl = document.createElement('img');
    imgEl.src = photos[0].src;
    imgEl.alt = photos[0].alt || '';
    imgEl.loading = 'lazy';
    cell.appendChild(imgEl);

    function show(i) {
      idx = (i + photos.length) % photos.length;
      imgEl.src = photos[idx].src;
      imgEl.alt = photos[idx].alt || '';
      if (dotsEl) {
        dotsEl.querySelectorAll('span').forEach((d, di) => d.classList.toggle('is-active', di === idx));
      }
    }

    cell.addEventListener('click', () => {
      const tag = categoryLabel ? `${categoryLabel} — ${photos[idx].alt}` : photos[idx].alt;
      lightbox.open(photos[idx].src, photos[idx].alt, tag);
    });

    let dotsEl = null;
    if (photos.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'cell-arrow prev';
      prevBtn.setAttribute('aria-label', 'Previous photo in this set');
      prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
      prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });

      const nextBtn = document.createElement('button');
      nextBtn.className = 'cell-arrow next';
      nextBtn.setAttribute('aria-label', 'Next photo in this set');
      nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';
      nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });

      dotsEl = document.createElement('div');
      dotsEl.className = 'cell-dots';
      photos.forEach((_, di) => {
        const dot = document.createElement('span');
        if (di === 0) dot.classList.add('is-active');
        dotsEl.appendChild(dot);
      });

      cell.appendChild(prevBtn);
      cell.appendChild(nextBtn);
      cell.appendChild(dotsEl);
    }

    container.appendChild(cell);
  });
}

// ---- video slider: paged, with click-to-embed thumbnails ----
function renderVideoSlider(container, videos) {
  const perPage = 3;
  const pages = [];
  for (let i = 0; i < videos.length; i += perPage) pages.push(videos.slice(i, i + perPage));

  const clip = document.createElement('div');
  clip.className = 'video-clip';
  const pagesWrap = document.createElement('div');
  pagesWrap.className = 'video-pages';

  pages.forEach(pageVideos => {
    const page = document.createElement('div');
    page.className = 'video-page';
    pageVideos.forEach(v => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumb" data-yt="${v.youtubeId}">
          <img src="https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg" alt="${v.title}" loading="lazy">
          <button class="play-btn" aria-label="Play ${v.title}">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="video-meta">
          <h3>${v.title}</h3>
          <p>${v.description}</p>
          <span class="video-tag">${v.tag}</span>
        </div>
      `;
      const thumb = card.querySelector('.video-thumb');
      thumb.addEventListener('click', () => {
        thumb.innerHTML = `<iframe src="https://www.youtube.com/embed/${v.youtubeId}?autoplay=1" title="${v.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      });
      page.appendChild(card);
    });
    pagesWrap.appendChild(page);
  });

  container.appendChild(clip);
  clip.appendChild(pagesWrap);

  if (pages.length > 1) {
    const dots = document.createElement('div');
    dots.className = 'video-dots';
    pages.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Page ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => {
        pagesWrap.style.transform = `translateX(-${i * 100}%)`;
        dots.querySelectorAll('button').forEach((d, idx) => d.classList.toggle('is-active', idx === i));
      });
      dots.appendChild(dot);
    });
    container.appendChild(dots);
  }
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
          renderSlotGrid(grid, cat.slots, lightbox, cat.name);
        });
      });
  }
  if (worksVideos) {
    fetch('videos.json')
      .then(r => r.json())
      .then(videos => renderVideoSlider(worksVideos, videos));
  }
});
