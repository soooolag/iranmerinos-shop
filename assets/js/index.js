'use strict';

/* ============================================================
   IRAN MERINOS — index.js
   منتقل شده از inline script در index.html
   ============================================================ */

// ── Gallery filters ───────────────────────────────────────────
(function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
})();

// ── Why rows reveal ────────────────────────────────────────────
(function initWhyReveal() {
  const whyRows = document.querySelectorAll('.why-row');
  if (!whyRows.length) return;
  const whyObs = new IntersectionObserver((entries) => {
    entries.forEach(x => {
      if (x.isIntersecting) {
        x.target.classList.add('visible');
        whyObs.unobserve(x.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -80px 0px' });
  whyRows.forEach(r => whyObs.observe(r));
})();

// ── Infinite slider — با cache برای رفع layout thrashing ──────
(function initSlider() {
  const outer = document.querySelector('.slider-outer');
  const track = document.getElementById('sliderTrack');
  if (!track || !outer) return;

  const cards = Array.from(track.querySelectorAll('.sl-card'));
  const n     = cards.length;
  let positions;
  let cachedCardW = 0; // ✅ cache برای رفع layout thrashing
  const speed = 1;
  let running = true;
  let raf;

  // ✅ یک‌بار اندازه می‌گیریم، نه هر frame
  function measureCardW() {
    const c = track.querySelector('.sl-card');
    cachedCardW = c ? c.getBoundingClientRect().width + 20 : 320;
  }

  // ✅ ResizeObserver برای update cache
  const ro = new ResizeObserver(() => { measureCardW(); });
  ro.observe(outer);

  function setPositions() {
    cards.forEach((card, i) => {
      card.style.position = 'absolute';
      card.style.left     = positions[i] + 'px';
      card.style.top      = '0';
    });
    if (cards[0]) {
      track.style.position = 'relative';
      track.style.height   = cards[0].offsetHeight + 'px';
      track.style.width    = '100%';
    }
  }

  function step() {
    if (running) {
      for (let i = 0; i < n; i++) {
        positions[i] -= speed;
        if (positions[i] + cachedCardW < 0) {
          const maxPos = Math.max(...positions);
          positions[i] = maxPos + cachedCardW;
        }
      }
      setPositions();
    }
    raf = requestAnimationFrame(step);
  }

  measureCardW();
  positions = cards.map((_, i) => i * cachedCardW);
  setPositions();

  // ✅ touch support برای موبایل
  outer.addEventListener('mouseenter',  () => running = false);
  outer.addEventListener('mouseleave',  () => running = true);
  outer.addEventListener('touchstart',  () => running = false, { passive: true });
  outer.addEventListener('touchend',    () => running = true,  { passive: true });

  raf = requestAnimationFrame(step);
})();
