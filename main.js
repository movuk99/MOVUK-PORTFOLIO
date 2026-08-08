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

// ---- lightbox (supports a single image OR a folder slideshow) ----
function buildLightbox() {
  const el = document.createElement('div');
  el.className = 'lightbox';
  el.innerHTML = `
    <button class="lightbox-close" aria-label="Close">✕</button>
    <div class="lightbox-frame">
      <button class="lightbox-arrow prev" aria-label="Previous photo" style="display:none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span class="lightbox-analog" style="display:none">Analog picture</span>
      <img src="" alt="">
      <button class="lightbox-arrow next" aria-label="Next photo" style="display:none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
      </button>
    </div>
    <figcaption></figcaption>
    <div class="lightbox-dots"></div>
  `;
  document.body.appendChild(el);

  const img = el.querySelector('img');
  const caption = el.querySelector('figcaption');
  const closeBtn = el.querySelector('.lightbox-close');
  const prevBtn = el.querySelector('.lightbox-arrow.prev');
  const nextBtn = el.querySelector('.lightbox-arrow.next');
  const analogTag = el.querySelector('.lightbox-analog');
  const dotsEl = el.querySelector('.lightbox-dots');

  let photos = [];
  let idx = 0;
  let label = '';

  function render() {
    const p = photos[idx];
    img.src = p.src;
    img.alt = p.alt || '';
    caption.textContent = label ? `${label} — ${p.alt || ''}` : (p.alt || '');
    analogTag.style.display = p.analog ? '' : 'none';
    dotsEl.querySelectorAll('span').forEach((d, di) => d.classList.toggle('is-active', di === idx));
  }
  function show(i) {
    idx = (i + photos.length) % photos.length;
    render();
  }

  // open(photosArray, startIndex, label)
  function open(photosArray, startIndex, categoryLabel) {
    photos = photosArray;
    idx = startIndex || 0;
    label = categoryLabel || '';

    const multi = photos.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
    dotsEl.style.display = multi ? '' : 'none';
    dotsEl.innerHTML = '';
    if (multi) {
      photos.forEach(() => dotsEl.appendChild(document.createElement('span')));
    }

    render();
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    el.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(idx - 1));
  nextBtn.addEventListener('click', () => show(idx + 1));
  el.addEventListener('click', (e) => { if (e.target === el) close(); });
  document.addEventListener('keydown', (e) => {
    if (!el.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  return { open };
}

// ---- render a grid of folders (one grid-cell per folder = one mini-gallery) ----
// folder: { title, photos: [{src, alt, analog}, ...] }  -- photos[0] is the cover/portada
// OR a link-out cell: { title, link: "https://...", photos: [{src, alt}] } -- opens the link instead of the lightbox
function renderFolderGrid(container, folders, lightbox, categoryLabel) {
  folders.forEach(folder => {
    if (folder.link) {
      const cell = document.createElement('a');
      cell.className = 'grid-cell grid-cell-link';
      cell.href = folder.link;
      cell.target = '_blank';
      cell.rel = 'noopener';

      const imgEl = document.createElement('img');
      imgEl.src = folder.photos[0].src;
      imgEl.alt = folder.photos[0].alt || folder.title || '';
      imgEl.loading = 'lazy';
      cell.appendChild(imgEl);

      const titleEl = document.createElement('span');
      titleEl.className = 'cell-title';
      titleEl.textContent = folder.title || '';
      cell.appendChild(titleEl);

      const iconEl = document.createElement('span');
      iconEl.className = 'cell-link-icon';
      iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>';
      cell.appendChild(iconEl);

      container.appendChild(cell);
      return;
    }

    const cell = document.createElement('div');
    cell.className = 'grid-cell';

    if (!folder.photos || folder.photos.length === 0) {
      cell.classList.add('is-empty');
      container.appendChild(cell);
      return;
    }

    const cover = folder.photos[0];
    const imgEl = document.createElement('img');
    imgEl.src = cover.src;
    imgEl.alt = cover.alt || folder.title || '';
    imgEl.loading = 'lazy';
    cell.appendChild(imgEl);

    const titleEl = document.createElement('span');
    titleEl.className = 'cell-title';
    titleEl.textContent = folder.title || '';
    cell.appendChild(titleEl);

    if (folder.photos.length > 1) {
      const countEl = document.createElement('span');
      countEl.className = 'cell-count';
      countEl.textContent = String(folder.photos.length).padStart(2, '0');
      cell.appendChild(countEl);
    }

    cell.addEventListener('click', () => {
      lightbox.open(folder.photos, 0, categoryLabel ? `${categoryLabel} — ${folder.title}` : folder.title);
    });

    container.appendChild(cell);
  });
}

// ---- video provider helpers ----
function videoThumb(v) {
  if (v.thumbnail) return v.thumbnail;
  if (v.provider === 'youtube') return `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
  return null; // vimeo / self without an explicit thumbnail -> plain placeholder
}
function videoEmbedHTML(v) {
  if (v.provider === 'youtube') {
    return `<iframe src="https://www.youtube.com/embed/${v.id}?autoplay=1" title="${v.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }
  if (v.provider === 'vimeo') {
    return `<iframe src="https://player.vimeo.com/video/${v.id}?autoplay=1" title="${v.title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }
  // self-hosted file in the repo (v.id is the file path, e.g. "videos/clip.mp4")
  return `<video src="${v.id}" controls autoplay playsinline></video>`;
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
      const thumb = videoThumb(v);
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumb${thumb ? '' : ' no-thumb'}">
          ${thumb ? `<img src="${thumb}" alt="${v.title}" loading="lazy">` : ''}
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
      const thumbEl = card.querySelector('.video-thumb');
      thumbEl.addEventListener('click', () => {
        thumbEl.innerHTML = videoEmbedHTML(v);
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

// ---- render the "Places I've worked at" hover mosaic ----
// ---- places strip: horizontal, infinitely-looping (native 2-finger / touch scroll) ----
function renderPlaces(container, places) {
  if (!places.length) return;
  places = shuffle(places.slice()); // new random order each page visit
  const SET_COUNT = 6; // enough repeats that the wrap point is never visible on any screen width
  const startSet = Math.floor(SET_COUNT / 2);

  for (let s = 0; s < SET_COUNT; s++) {
    places.forEach(p => {
      const item = document.createElement('div');
      item.className = 'place-item';
      item.innerHTML = `
        <img src="${p.src}" alt="${p.location}" loading="lazy" draggable="false">
        <div class="place-overlay"><span>${p.location}</span></div>
      `;
      container.appendChild(item);
    });
  }

  let setWidth = 0;
  function measure() {
    setWidth = container.scrollWidth / SET_COUNT;
    if (setWidth > 0) container.scrollLeft = setWidth * startSet;
  }

  const imgs = container.querySelectorAll('img');
  let loaded = 0;
  imgs.forEach(img => {
    if (img.complete) loaded++;
    else img.addEventListener('load', () => { loaded++; if (loaded === imgs.length) measure(); }, { once: true });
  });
  if (loaded === imgs.length) measure();
  setTimeout(measure, 900); // safety re-measure in case some images were slow/cached oddly

  container.addEventListener('scroll', () => {
    if (!setWidth) return;
    if (container.scrollLeft < setWidth * 0.5) {
      container.scrollLeft += setWidth;
    } else if (container.scrollLeft > setWidth * (SET_COUNT - 1.5)) {
      container.scrollLeft -= setWidth;
    }
  });
}

// ---- utilities: shuffle, image-load tracking, page loader ----
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function waitForImages() {
  const imgs = Array.from(document.images);
  return Promise.all(imgs.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }));
}

function waitForVideos() {
  const vids = Array.from(document.querySelectorAll('video'));
  return Promise.all(vids.map(v => {
    if (v.readyState >= 2) return Promise.resolve(); // HAVE_CURRENT_DATA or better
    return new Promise(resolve => {
      v.addEventListener('loadeddata', resolve, { once: true });
      v.addEventListener('error', resolve, { once: true });
    });
  }));
}

function initReducedMotionVideo() {
  const video = document.querySelector('.works-hero video');
  if (!video) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause();
    video.removeAttribute('autoplay');
    video.removeAttribute('loop');
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.classList.add('is-hidden');
  setTimeout(() => loader.remove(), 600);
}

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  initReducedMotionVideo();
  const lightbox = buildLightbox();

  const tasks = [];

  // Home full-bleed slider — random order each visit
  const heroSlider = document.querySelector('[data-slider="hero"]');
  if (heroSlider) {
    tasks.push(
      fetch('photos.json')
        .then(r => r.json())
        .then(data => initSlider(heroSlider, shuffle(data.hero.slice())))
    );
  }

  // Works page: photography categories + video slider
  const worksPhotos = document.querySelector('[data-works="photography"]');
  const worksVideos = document.querySelector('[data-works="videography"]');
  if (worksPhotos) {
    tasks.push(
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
            renderFolderGrid(grid, cat.folders, lightbox, cat.name);
          });
        })
    );
  }
  if (worksVideos) {
    tasks.push(
      fetch('videos.json')
        .then(r => r.json())
        .then(videos => renderVideoSlider(worksVideos, videos))
    );
  }

  // About page: places mosaic
  const placesGrid = document.querySelector('[data-places]');
  if (placesGrid) {
    tasks.push(
      fetch('places.json')
        .then(r => r.json())
        .then(places => renderPlaces(placesGrid, places))
    );
  }

  // Wait for all dynamic content to render, then for every image (static +
  // dynamic) and web fonts to finish, with a safety timeout so a slow
  // network never leaves the loader stuck forever.
  const readyPromise = Promise.all(tasks)
    .then(() => Promise.all([waitForImages(), waitForVideos()]))
    .then(() => (document.fonts && document.fonts.ready ? document.fonts.ready : null))
    .then(() => wait(350)); // small floor so the loader never just flashes

  await Promise.race([readyPromise, wait(8000)]);
  hidePageLoader();
});
